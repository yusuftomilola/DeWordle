import { ReactNode } from "react"

import Footer from "@/components/atoms/footer"
import Header from "@/components/organism/games/Spelling-bee/SpellingBeeHeader"

interface Props {
  children: ReactNode
}

const SpellingBeelayout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <div className="grow">{children}</div>
      <Footer />
    </>
  )
}

export default SpellingBeelayout
