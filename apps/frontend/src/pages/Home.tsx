import { Link } from "react-router";

function Home() {
  return (
    <div className="flex flex-col justify-center py-24 gap-2 flex-1">
      <h1 className="text-6xl text-center mb-6">Where's Waldo?</h1>
      <div className="flex flex-col justify-center items-center gap-2">
        <Link to={"/play"}>Play</Link>
        <Link to={"/leaderboard"}>Leaderboard</Link>
        <Link to={"/how-to-play"}>How to Play</Link>
      </div>
    </div>
  );
}

export default Home;
