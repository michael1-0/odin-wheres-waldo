import { prisma } from "../db/prisma.js";
async function getScores(req, res) {
    try {
        const scores = await prisma.score.findMany({
            orderBy: [{ elapsedMs: "asc" }, { createdAt: "asc" }],
        });
        res.json({ scores });
    }
    catch (error) {
        console.error("[getScores]", error);
        res.status(500).json({ error: "Failed to fetch scores." });
    }
}
export { getScores };
//# sourceMappingURL=scoreController.js.map