import {config} from "dotenv"
import { TwitterApi } from "twitter-api-v2"
config();

const twitterClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET
});

export async function createXPost(status){
    const newPost = await twitterClient.v2.tweet(status);

    return {
        content: [
            {
                type: "text",
                text: `Tweeted ${status}`
            }
        ]
    }
}