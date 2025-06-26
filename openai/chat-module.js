const { OpenAI } = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const dayjs = require('dayjs');
const _ = require('lodash');

async function handleToolCall(req, res, actionResults, threadId, runId) {
  let nextRunId = "";
  let targetCallId = ""
  let targetFunc = "";
  let argBuffer = "";
  let hasToolCall = false;
  let messageBuffer = "";
  res.messageChunks = [];
  let metaBuffer = '';
  const arr = []
  for (const a of actionResults) {
    const output = JSON.parse(a.output);
    const data = output.data;
    const parameter = [];
    if (data.method === 'method_A') {
      parameter.push(data.param1);
    }
    if (data.method === 'method_B') {
      parameter.push(data.param1);
      parameter.push(data.param2);
    }
    if (data.method === 'method_C') {
      parameter.push(data.param1);
      parameter.push(data.param2);
      parameter.push(data.param3);
      parameter.push(data.param4);
      parameter.push(data.param5);
    }
    arr.push({ method: data.method, parameter });
  }

  if (arr.length > 0)
    metaBuffer = JSON.stringify(arr);
  try {
    res.finishWrite = async () => {
      console.log("finishWrite");
      const md = new Message({
        role: 'assistant',
        thread: threadId,
        text: messageBuffer,
      });
      if (metaBuffer && metaBuffer.length > 0) {
        md.metadata = metaBuffer;
      }
      await md.save();
      const thread = await Thread.findById(threadId);
      thread.lastMessage = {
        role: 'assistant',
        text: md.text,
        createdAt: md.createdAt
      };
      if (arr.length > 0) {
        const isA = arr.find(a => a.method === 'method_A');
        if (isA) {
          //method_A
        }
        const isB = arr.find(a => a.method === 'method_B');
        if (isB) {
          //method_B
        }
        const isC = arr.find(a => a.method === 'method_C');
        if (isC) {
          //method_C
        }
      }
      res.end();
    }

    const stream = await openai.beta.threads.runs.submitToolOutputsStream(threadId, runId, { tool_outputs: actionResults })
      .on('runStepCreated', runStep => {
        console.log("runStepCreated");
        console.log(runStep);
        nextRunId = runStep.run_id;
      })
      .on('toolCallCreated', (toolCall) => {
        console.log("toolCallCreated");
        hasToolCall = true;
        targetCallId = toolCall.id;
        targetFunc = toolCall.function.name;
        argBuffer = "";
        console.log(toolCall);
      })
      .on('toolCallDelta', (toolCallDelta) => {
        console.log("toolCallDelta");
        argBuffer += toolCallDelta.function.arguments;
        console.log(toolCallDelta);
      })
      .on('toolCallDone', async (toolCall) => {
        console.log("toolCallDone B");
        console.log(JSON.parse(argBuffer));
        const output = res.handleFunctionCallMethod(targetFunc, JSON.parse(argBuffer));
        const newActionResults = [
          {
            tool_call_id: targetCallId,
            output: JSON.stringify(output)
          }
        ];
        await handleToolCall(req, res, newActionResults, threadId, nextRunId);
      })
      .on('textCreated', (text) => {
        res.messageChunks.push('\n\n');
      })
      .on('textDelta', (delta) => {
        messageBuffer += delta.value;
        res.write(JSON.stringify({ type: 'text', content: delta.value }));
        res.messageChunks.push(delta.value);
        return;
      })
      .on('textDone', async () => {
        console.log("tool text done");
      })
      .on('end', async () => {
        console.log("end");
        if (!hasToolCall) {
          console.log('toolCall end');
          res.finishWrite();
        }
      });
  } catch (err) {
    const actionResults = [
      {
        tool_call_id: targetCallId,
        output: JSON.stringify({ message: "Error: Could not handle request.", error: err })
      }
    ];
    const stream = await openai.beta.threads.runs.submitToolOutputsStream(threadId, nextRunId, { tool_outputs: actionResults })
      .on('textDelta', (delta) => {
        console.log("TextDelta B");
        console.log(delta);
        res.writeMessageChunk(delta.value);
      })
      .on('textDone', async () => {
        console.log("tool text done");
      })
      .on('end', async () => {
        console.log('toolCall end error')
        res.finishWrite();
      });
    console.log("toolCallDone with Error");
  }
}

async function createMessage(req, res, assistant_id) {
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const { threadId, content } = req.body;
  if (!threadId)
    return res.status(400).json({ message: '대화방이 없습니다.' });
  if (!content)
    return res.status(400).json({ message: '메시지를 입력해주세요.' });
  // create Message and save to mongodb
  try {
    const md = new Message({
      role: 'user',
      thread: threadId,
      text: content
    });
    await md.save();

    await Thread.findOneAndUpdate(
      { _id: threadId },
      {
        $set: {
          lastMessage: {
            role: 'user',
            text: md.text,
            createdAt: md.createdAt
          }
        }
      }
    );

    res.messageChunks = [];

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }

  res.handleFunctionCallMethod = function handleFunctionCallMethod(method, args) {
    switch (method) {
      case 'method_A': {
        const meta = {
          method: 'method_A',
          parameter: [...args]
        }
        // method_A
        res.write(JSON.stringify({ type: 'metadata', content: JSON.stringify(meta) }));
        return { result: 'success', data: { method: 'method_A', ...args } };
      }
      case 'method_B': {
        const meta = {
          method: 'method_B',
          parameter: [args.emoji, args.title]
        }
        // method_B
        res.write(JSON.stringify({ type: 'metadata', content: JSON.stringify(meta) }));
        return { result: 'success', data: { method: 'method_B', ...args } };
      }
      case 'method_C': {
        const meta = {
          method: 'method_C',
          parameter: [...args]
        }
        // method_C
        res.write(JSON.stringify({ type: 'metadata', content: JSON.stringify(meta) }));
        return {
          result: 'success',
          data: {
            method: 'method_C',
            ...args
          }
        };
      }
      default:
        return { result: 'failed', message: "Error: Could not handle request." };
    }
  };

  res.finishWrite = async () => {
    try {
      const md = new Message({
        role: 'assistant',
        thread: threadId,
        text: messageBuffer,
      });
      if (metaBuffer && metaBuffer.length > 0) {
        md.metadata = metaBuffer;
      }
      await md.save();
      const thread = await Thread.findById(threadId);
      thread.lastMessage = {
        role: 'assistant',
        text: md.text,
        createdAt: md.createdAt
      };
      await thread.save();
    } catch (err) {
      console.log(err);
    }
    res.end();
  }
  const messageChunks = [content];
  const message = await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: messageChunks.join('\n\n')
    }
  );
  let runId = "";
  let targetCallId = "";
  let targetFunc = "";
  let argBuffer = "";
  let hasToolCall = false;
  let messageBuffer = "";
  let metaBuffer = "";
  const actionResults = [];
  const run = await openai.beta.threads.runs.createAndStream(
    threadId,
    {
      assistant_id,
      additional_instructions: (() => {
        const date = dayjs().format('YYYY년 M월 D일');
        return `오늘은 ${date}입니다.`;
      })()
    }
  )
    .on('runStepCreated', runStep => {
      console.log(runStep);
      runId = runStep.run_id;
    })
    .on('textDelta', (delta) => {
      console.log("TextDelta A");
      messageBuffer += delta.value;
      res.write(JSON.stringify({ type: 'text', content: delta.value }));
      res.messageChunks.push(delta.value);
      return;
    })
    .on('textDone', () => {
      console.log("textDone");
      // timeout = setTimeout(() => {
      //   console.log("Timeout");
      // }, 3000);
    })
    .on('messageCreated', (message) => {
      console.log(message);
    })
    .on('messageDelta', (messageDelta) => {
      console.log('messageDelta');
      console.log(messageDelta.content);
    })
    .on('messageDone', (message) => {
      console.log('messageDone');
    })
    .on('toolCallCreated', (toolCall) => {
      hasToolCall = true
      targetCallId = toolCall.id;
      targetFunc = toolCall.function.name;
      argBuffer = "";
      console.log(toolCall);
    })
    .on('toolCallDelta', (toolCallDelta) => {
      argBuffer += toolCallDelta.function.arguments;
      console.log(toolCallDelta);
    })
    .on('toolCallDone', async (toolCall) => {
      console.log("toolCallDone");
      const output = res.handleFunctionCallMethod(targetFunc, JSON.parse(argBuffer));
      console.log(output);
      actionResults.push(
        {
          tool_call_id: targetCallId,
          output: JSON.stringify(output)
        }
      );
    })
    .on('end', async () => {
      console.log("end A");
      if (!hasToolCall && actionResults.length === 0) {
        console.log('toolCall end');
        res.finishWrite();
      }
      if (hasToolCall && actionResults.length > 0) {
        console.log('need to handle tool call');
        metaBuffer = JSON.stringify(actionResults);
        await handleToolCall(req, res, actionResults, threadId, runId);
      }
    })
}

module.exports = createMessage;