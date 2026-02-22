import { Link } from "react-router";
import characters from "../assets/characters.png";

function HowToPlay() {
  return (
    <div className="flex-1 flex flex-col justify-between items-stretch gap-6 min-h-dvh">
      <div className="flex justify-center sticky top-0 z-99999">
        <Link to={"/"} className="text-center text-xl  bg-white p-4 flex-1">
          Back to Menu
        </Link>
      </div>
      <div className="flex flex-col items-center text-center gap-10 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl">How to Play</h1>
          <p>
            Find all hidden characters as fast as you can to get a top score.
          </p>
        </div>
        <section className="space-y-3">
          <h2 className="text-2xl">Goal</h2>
          <p>Locate these three characters in the map image:</p>
          <img src={characters} alt="list of characters" />
        </section>
        <section className="space-y-3 flex flex-col items-center">
          <h2 className="text-2xl">Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-start flex flex-col gap-2">
            <li>Open the game from the menu by clicking Play.</li>
            <li>
              Click on a spot in the image where you think a character is.
            </li>
            <li>Choose the character name from the popup menu.</li>
            <li>
              If your guess is correct, that character is marked as found. If
              not, you can keep searching.
            </li>
            <li>
              Continue until all three characters are found and the timer stops.
            </li>
          </ol>
        </section>
      </div>
      <Link to={"/play"} className=" text-center underline p-4">
        Play now!
      </Link>
    </div>
  );
}

export default HowToPlay;
