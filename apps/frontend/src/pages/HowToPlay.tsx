import { Link } from "react-router";

function HowToPlay() {
  return (
    <div className="flex-1 flex flex-col justify-center items-stretch">
      <h1 className="text-2xl">How to Play</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque eos qui
        fuga molestias expedita maiores possimus alias iste. Officiis deserunt
        ex voluptatum odio. Modi quasi, facere harum quod animi corrupti.
      </p>
      <Link to={"/"}>Go Back</Link>
    </div>
  );
}

export default HowToPlay;
