/**
 * CI guard for #1530: every POST/PUT/PATCH handler that reads `@Body()` must
 * bind it to a DTO class whose properties carry class-validator decorators.
 * Runs statically over the TypeScript sources so it needs no app bootstrap.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const SRC = path.resolve(__dirname, '../..');
const WRITE_METHODS = new Set(['Post', 'Put', 'Patch']);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') walk(full, out);
    } else if (entry.name.endsWith('.controller.ts')) {
      out.push(full);
    }
  }
  return out;
}

const parse = (file: string) =>
  ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
  );

const decoratorName = (d: ts.Decorator): string | undefined => {
  const e = d.expression;
  if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) {
    return e.expression.text;
  }
  return ts.isIdentifier(e) ? e.text : undefined;
};

const decoratorsOf = (node: ts.Node): ts.Decorator[] =>
  (ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined)?.slice() ??
  [];

function resolveImport(sf: ts.SourceFile, name: string): string | undefined {
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const spec = (stmt.moduleSpecifier as ts.StringLiteral).text;
    const bindings = stmt.importClause.namedBindings;
    const names =
      bindings && ts.isNamedImports(bindings)
        ? bindings.elements.map((e) => e.name.text)
        : [];
    if (!names.includes(name) || !spec.startsWith('.')) continue;
    const base = path.resolve(path.dirname(sf.fileName), spec);
    for (const candidate of [`${base}.ts`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

/** Finds the file declaring `className`, following barrel re-exports. */
function findClassFile(
  file: string,
  className: string,
  seen = new Set<string>(),
): string | undefined {
  if (seen.has(file)) return undefined;
  seen.add(file);
  const sf = parse(file);
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name?.text === className) {
      return file;
    }
    if (
      ts.isExportDeclaration(stmt) &&
      stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier) &&
      stmt.moduleSpecifier.text.startsWith('.')
    ) {
      const base = path.resolve(path.dirname(file), stmt.moduleSpecifier.text);
      for (const c of [`${base}.ts`, path.join(base, 'index.ts')]) {
        if (fs.existsSync(c)) {
          const found = findClassFile(c, className, seen);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function classValidatorImports(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const spec = (stmt.moduleSpecifier as ts.StringLiteral).text;
    if (spec !== 'class-validator' && spec !== 'class-transformer') continue;
    const b = stmt.importClause.namedBindings;
    if (b && ts.isNamedImports(b)) b.elements.forEach((e) => names.add(e.name.text));
  }
  return names;
}

function dtoHasValidators(file: string, className: string): boolean {
  const sf = parse(file);
  const validators = classValidatorImports(sf);
  for (const stmt of sf.statements) {
    if (!ts.isClassDeclaration(stmt) || stmt.name?.text !== className) continue;
    // Inherited DTOs (PartialType(...) etc.) are validated through their base.
    if (stmt.heritageClauses?.length) return true;
    return stmt.members.some((m) =>
      decoratorsOf(m).some((d) => validators.has(decoratorName(d) ?? '')),
    );
  }
  return false;
}

/**
 * With `whitelist` + `forbidNonWhitelisted`, a property with no class-validator
 * decorator is rejected as "should not exist", so each one needs a validator.
 */
function undecoratedProperties(file: string, className: string): string[] {
  const sf = parse(file);
  const validators = classValidatorImports(sf);
  const missing: string[] = [];
  for (const stmt of sf.statements) {
    if (!ts.isClassDeclaration(stmt) || stmt.name?.text !== className) continue;
    for (const m of stmt.members) {
      if (!ts.isPropertyDeclaration(m)) continue;
      if (!decoratorsOf(m).some((d) => validators.has(decoratorName(d) ?? ''))) {
        missing.push(m.name.getText(sf));
      }
    }
  }
  return missing;
}

interface Violation {
  where: string;
  reason: string;
}

function audit(): { checked: number; violations: Violation[] } {
  const violations: Violation[] = [];
  let checked = 0;
  for (const file of walk(SRC)) {
    const sf = parse(file);
    const visit = (node: ts.Node) => {
      if (ts.isMethodDeclaration(node)) {
        const isWrite = decoratorsOf(node).some((d) =>
          WRITE_METHODS.has(decoratorName(d) ?? ''),
        );
        if (isWrite) {
          for (const param of node.parameters) {
            const body = decoratorsOf(param).find(
              (d) => decoratorName(d) === 'Body',
            );
            if (!body) continue;
            checked += 1;
            const where = `${path.relative(SRC, file)}#${node.name.getText(sf)}`;
            const call = body.expression;
            if (ts.isCallExpression(call) && call.arguments.length > 0) {
              violations.push({ where, reason: "@Body('prop') bypasses DTO validation" });
              continue;
            }
            const type = param.type;
            if (!type || !ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
              violations.push({ where, reason: '@Body() is not typed with a DTO class' });
              continue;
            }
            const typeName = type.typeName.text;
            const importFile = resolveImport(sf, typeName);
            const dtoFile = importFile
              ? findClassFile(importFile, typeName)
              : findClassFile(file, typeName);
            if (!dtoFile) {
              violations.push({ where, reason: `DTO ${typeName} not found` });
            } else if (!dtoHasValidators(dtoFile, typeName)) {
              violations.push({ where, reason: `DTO ${typeName} has no class-validator decorators` });
            } else {
              const missing = undecoratedProperties(dtoFile, typeName);
              if (missing.length > 0) {
                violations.push({
                  where,
                  reason: `DTO ${typeName} properties without validators: ${missing.join(', ')}`,
                });
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return { checked, violations };
}

describe('request body validation coverage (#1530)', () => {
  const result = audit();

  it('finds the controllers under audit', () => {
    expect(result.checked).toBeGreaterThan(5);
  });

  it('every write endpoint binds @Body() to a validated DTO', () => {
    expect(result.violations).toEqual([]);
  });
});
