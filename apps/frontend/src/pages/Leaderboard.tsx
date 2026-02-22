import { Link } from "react-router";
import { Fragment, useEffect, useState } from "react";

type Score = {
  id: string;
  playerName: string;
  elapsedMs: number;
  createdAt: string;
  message: string | null;
};

type ScoresResponse = {
  scores: Score[];
};

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}scores`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard.");
        }
        return response.json() as Promise<ScoresResponse>;
      })
      .then((data) => {
        setScores(data.scores);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException) {
          return;
        }
        setError("Could not load leaderboard. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-w-full">
        <p className="text-center items-center">Loading scores...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between items-stretch gap-6 min-h-dvh">
      <div className="flex justify-center sticky top-0 z-99999">
        <Link to={"/"} className="text-center text-xl  bg-white p-4 flex-1">
          Back to Menu
        </Link>
      </div>
      <div className="flex flex-col gap-10 p-4">
        {error ? <p className="text-center">{error}</p> : null}

        {scores.length > 0 ? (
          <div className="max-w-xl mx-auto w-full overflow-hidden border rounded-sm">
            <table className="w-full text-sm ">
              <thead className="border-b">
                <tr className="[&>th]:px-2 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium [&>th]:tracking-wide">
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => {
                  const topRankRowClass =
                    index === 0
                      ? "bg-black/[0.045]"
                      : index === 1
                        ? "bg-black/[0.03]"
                        : index === 2
                          ? "bg-black/[0.015]"
                          : "";

                  return (
                    <Fragment key={score.id}>
                      <tr
                        className={`${topRankRowClass} hover:bg-black/5 transition-colors`}
                      >
                        <td
                          className={`px-2 py-3 tabular-nums ${index < 3 ? "font-semibold" : ""}`}
                        >
                          {index + 1}
                        </td>
                        <td className="px-2 py-3">{score.playerName}</td>
                        <td className="px-2 py-3 font-mono tabular-nums">
                          {formatElapsedTime(score.elapsedMs)}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          {formatCreatedAt(score.createdAt)}
                        </td>
                      </tr>
                      <tr
                        className={`${topRankRowClass} hover:bg-black/5 transition-colors ${index < scores.length - 1 ? "border-b" : ""}`}
                      >
                        <td
                          colSpan={4}
                          className="px-2 pb-3 text-xs opacity-80"
                        >
                          Message: {score.message ?? "-"}
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center">No scores yet</div>
        )}
      </div>
      <Link to={"/play"} className="text-center underline p-4">
        {" "}
        Play now!
      </Link>
    </div>
  );
}

export default Leaderboard;
