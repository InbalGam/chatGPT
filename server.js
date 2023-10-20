import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from "dotenv";
import OpenAI from "openai";
import data from './readCSV.js';

dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors(
    {origin : process.env.CORS_ORIGIN, //(Whatever the frontend url is) 
    credentials: true, // <= Accept credentials (cookies) sent by the client
  }
));

app.use(express.json());


app.get('/', async (req, res) => {
    res.status(200).send({msg: 'hello'});
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        console.log(prompt);
        const getQKeywords = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    "role": "user",
                    "content": `give me keywords from this - ${prompt}`
                }
            ],
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        console.log(getQKeywords.choices[0].message.content);
        const userKeywords = getQKeywords.choices[0].message.content.split(',');
        console.log(userKeywords);        

        const faqs = [];
        for (let i = 0; i < data.length; i++) {
            console.log(data[i].keywords);
            if (userKeywords.some(r=> data[i].keywords.includes(r))) {
                faqs.push(data[i].faq);
            }         
        };
        console.log(faqs);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    "role": "user",
                    "content": `based on this information ${faqs}
                    answer this question ${prompt}`
                }
            ],
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.choices[0].message.content
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({ msg: 'error' });
    }
});


const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

