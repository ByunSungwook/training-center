const { OpenAI } = require('openai');
const openai = new OpenAI({
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' },
  apiKey: process.env.OPENAI_API_KEY
});

async function getResponse(assistantId, input, additionalInstruction = '') {
  const thread = await openai.beta.threads.create();
  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      "role": "user",
      "content": input
    }
  );
  let run = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: assistantId,
      additional_instructions: additionalInstruction
    }
  )
  while (['queued', 'in_progress', 'cancelling', 'requires_action'].includes(run.status)) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    run = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
  }
  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );
    const response = messages.data[0].content
      .filter(content => content.type === 'text')
      .reduce((acc, cur) => acc + cur.text.value, '');
    console.log("[GPTResponse]\n", response);
    let result = response;
    if (response) {
      if (response.indexOf('```json') > -1) {
        result = result.replace('```json', '');
      }
      if (response.indexOf('```') > -1) {
        result = result.replace('```', '');
      }
    }
    console.log("[parsedResponse]\n", result);
    const parsed = JSON.parse(result);
    return parsed;
  }
  throw new Error('Run failed');
}

module.exports = { getResponse }