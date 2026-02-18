import type { Request, Response } from "express";
declare function helloWorld(req: Request, res: Response): void;
declare function gameStart(req: Request, res: Response): void;
declare function gameGuess(req: Request, res: Response): void;
declare function gameEnd(req: Request, res: Response): Promise<void>;
export { helloWorld, gameStart, gameGuess, gameEnd };
//# sourceMappingURL=indexController.d.ts.map