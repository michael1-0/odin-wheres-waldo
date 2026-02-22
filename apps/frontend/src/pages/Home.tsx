import { Link } from "react-router";

function Home() {
  return (
    <div className="flex flex-col justify-center py-24 gap-2 flex-1">
      <h1 className="text-6xl text-center mb-6 font-bold">
        <span className="text-blue-500">Where&apos;s</span>{" "}
        <span className="text-red-500">Waldo?</span>
      </h1>
      <div className="flex flex-col justify-center items-center gap-2">
        <Link
          to={"/play"}
          className="transition-colors duration-200 hover:text-blue-500"
        >
          Play
        </Link>
        <Link
          to={"/leaderboard"}
          className="transition-colors duration-200 hover:text-red-500"
        >
          Leaderboard
        </Link>
        <Link
          to={"/how-to-play"}
          className="transition-colors duration-200 hover:text-blue-500"
        >
          How to Play
        </Link>
      </div>
    </div>
  );
}

export default Home;
