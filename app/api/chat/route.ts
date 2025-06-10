import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from 'next/server';
import { ModelId } from '@/types/bedrock';
import OpenAI from "openai";

// OpenAI 인스턴스의 타입 정의
let openai: OpenAI | undefined;

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('OpenAI initialization error:', error);
}

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION_BEDROCK,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

async function callChatGPT(message: string) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "너는 요리 마스터야. 요즘 유행하는 음식에 대해서 정말 잘 알고 있지. 너는 사람들에게 요리 관련 정보를 제공해야해. 그리고 말투는 백종원으로 해야해." 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 1000,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API error:', error);
    throw error;
  }
}

function getModelPayload(modelId: ModelId, message: string) {
  if (modelId.includes('anthropic')) {
    return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: message }],
        }
      ],
    };
  }
  
  if (modelId.includes('amazon')) {
    return {
      inputText: message,
      textGenerationConfig: {
        maxTokenCount: 30,
        temperature: 0.2,
      },
    };
  }

  if (modelId.includes('ai21')) {
    return {
      prompt: message,
      maxTokens: 200,
      temperature: 0.2,
    };
  }

  if (modelId.includes('mistral')) {
    return {
      prompt: `<s>[INST] ${message} [/INST]`,
      max_tokens: 512,
      temperature: 0.5,
    };
  }

  if (modelId.includes('meta')) {
    return {
      prompt: `<|begin_of_text|>
      <|start_header_id|>user<|end_header_id|>
      ${message}
      <|eot_id|>
      <|start_header_id|>assistant<|end_header_id|>`,
      max_gen_len: 512,
      temperature: 0.5,
    };
  }

  throw new Error('Unsupported model');
}

function parseModelResponse(modelId: ModelId, response: any) {
  if (modelId.includes('anthropic')) {
    return response.content[0].text;
  }
  if (modelId.includes('amazon')) {
    return response.results[0].outputText;
  }
  if (modelId.includes('ai21')) {
    return response.completions[0].data.text;
  }
  if (modelId.includes('mistral')) {
    return response.outputs[0].text;
  }
  if (modelId.includes('meta')) {
    return response.generation;
  }
  throw new Error('Unsupported model');
}

export async function POST(request: Request) {
  try {
    const { message, modelId } = await request.json();
    // // console.log('Received request:', { message, modelId });

    // ChatGPT 처리
    if (modelId === 'gpt-4o') {
      try {
        // // console.log('Calling ChatGPT API...');
        const response = await callChatGPT(message);
        // console.log('ChatGPT response:', response);
        return NextResponse.json({ response });
      } catch (error) {
        console.error('ChatGPT error:', error);
        return NextResponse.json(
          { error: 'ChatGPT API 호출 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // Bedrock 모델 처리
    // console.log('Calling Bedrock API...');
    const payload = getModelPayload(modelId, message);
    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const parsedResponse = parseModelResponse(modelId, responseBody);
    // console.log('Bedrock response:', parsedResponse);

    return NextResponse.json({ response: parsedResponse });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}