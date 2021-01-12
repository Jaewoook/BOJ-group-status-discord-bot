import { NowRequest, NowResponse } from "@vercel/node";
import { Reporter } from "../reporter";
import { StatusData, StatusParser } from "../status-parser";

const handler = async (req: NowRequest, res: NowResponse) =>{
    const { discord_token, boj_token, boj_group_code, discord_channel_id } = req.query;
    const reporter = new Reporter(discord_token as string, discord_channel_id as string);
    const statusParser = new StatusParser(boj_token as string);
    try {
        const result = await Promise.all<StatusData[], void>([
            statusParser.parse(Number.parseInt(boj_group_code as string)),
            reporter.login()
        ]);
        const sentResult = await reporter.notify(result[0]);
        res.json({
            status: "OK",
            data: {
                originals: result[0],
                sent: sentResult,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            error: err,
        });
    }
};

export default handler;
