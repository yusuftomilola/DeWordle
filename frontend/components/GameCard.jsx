import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

function GameCard({ bgColor, icon, title, description, available }) {
	return (
		<div
			className="game-card border-black border-4 rounded-lg overflow-hidden flex flex-col 
                  hover:scale-105 hover:shadow-2xl hover:z-10 cursor-pointer
                  transition-all duration-300 ease-in-out"
		>
			<div className={`${bgColor} p-8 flex justify-center items-center h-72`}>
				<div className="w-48 h-48">
					<img
						src={icon}
						alt={`${title} icon`}
						className="w-full h-full object-cover"
					/>
				</div>
			</div>
			<div className="p-4 bg-white flex-grow">
				<h3 className="text-3xl font-bold">{title}</h3>
				<p className="text-xl py-4 mb-4">{description}</p>
				{available ? (
					<Button
						variant="outline"
						className="border-[#29296e] text-[#29296e] hover:bg-[#29296e]/10 rounded-full px-6"
						asChild
					>
						<Link href="/game?id=someid">Play Now</Link>
					</Button>
				) : (
					<p className="text-indigo-800 text-sm md:text-xl font-extrabold">
						Coming Soon!
					</p>
				)}
			</div>
		</div>
	);
}

export default GameCard;
