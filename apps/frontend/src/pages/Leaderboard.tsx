import { Link } from "react-router";

function Leaderboard() {
  return (
    <div className="flex-1 flex flex-col justify-center items-stretch">
      <h1 className="text-2xl">Leaderboard</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque eos qui
        fuga molestias expedita maiores possimus alias iste. Officiis deserunt
        ex voluptatum odio. Modi quasi, facere harum quod animi corrupti.
      </p>
      <Link to={"/"}>Go Back</Link>
    </div>
  );
}

export default Leaderboard;
