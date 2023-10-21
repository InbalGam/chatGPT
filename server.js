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

function compare( a, b ) {
    if ( a.wordsAmount > b.wordsAmount ){
      return -1;
    }
    if ( a.wordsAmount < b.wordsAmount ){
      return 1;
    }
    return 0;
};

app.get('/', async (req, res) => {
    res.status(200).send({msg: 'hello'});
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
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

        const userKeywords = getQKeywords.choices[0].message.content.split(',');
        console.log(userKeywords);        

        const faqs = [];
        // generic- without looking for most common keywords
        // for (let i = 0; i < data.length; i++) {
        //     console.log(data[i].keywords);
        //     if (userKeywords.some(r=> data[i].keywords.includes(r.trim().toLowerCase()))) {
        //         faqs.push(data[i].faq);
        //     }         
        // };
        let sameWordsAmount = 0;
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < userKeywords.length; j++) {
                sameWordsAmount += data[i].keywords.map(word => {
                    if (word === userKeywords[j].trim().toLowerCase()) {
                    return 1;
                } else {
                    return 0;
                }
            }).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            }
            faqs.push({faq: data[i].faq, wordsAmount: sameWordsAmount});
            sameWordsAmount = 0;  
        };
        faqs.sort(compare);
        console.log(faqs);
        console.log(faqs.slice(0,3));

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    "role": "user",
                    "content": `based on this information ${faqs.slice(0,3).map(q => q.faq)}
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

