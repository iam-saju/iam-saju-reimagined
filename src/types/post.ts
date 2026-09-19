export interface Section {
  id: string;
  heading: string;
  body: string;
  code?: string;
  /** Label for the code block; anything other than 'python' skips python highlighting. */
  lang?: string;
  image?: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  readTime: string;
  draft?: boolean;
  lightBg?: boolean;
  link?: string;
  quote?: string;
  cardImage?: string;
  imagePosition?: string;
  cardImagePosition?: string;
  zoom?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
  sections: Section[];
}

export const posts: Post[] = [
  {
    slug: 'rl-painter',
    title: 'RL Painter',
    description:
      'a project log on training a language model to write p5.js code that paints — the pipeline, the broken reward function, the API debugging, and why RL comes last.',
    image: '',
    tags: ['rl', 'agents', 'inference'],
    date: 'sep 2026',
    readTime: '16 min read',
    draft: false,
    sections: [
      {
        id: 'the-idea',
        heading: 'the idea: teach an llm to paint with code',
        body: `i started with a simple question: can i train a language model to write code that produces beautiful watercolour paintings?\n\nnot an AI image generator. not a model that directly outputs pixels. i wanted the model to write JavaScript, use \`p5.js\` and \`p5.brush\`, render that code into an image, and then learn from a visual reward.\n\nthe project ended up teaching me far more about RL, model inference, reward functions, APIs and evaluation than i expected. i called it RL Painter, and the basic loop looks like this:`,
        code: `Text prompt
    ↓
LLM / RL policy
    ↓
JavaScript code
    ↓
p5.js + p5.brush
    ↓
Rendered PNG
    ↓
Visual reward
    ↓
RL training
    ↓
Better JavaScript`,
        lang: 'text',
      },
      {
        id: 'model-writes-code',
        heading: 'the model writes code, not pixels',
        body: `the input might be "a red rose painted in loose watercolour". the model's output should not be an image — it should be a program that then gets rendered.\n\nso the final product of the model is JavaScript to image, and RL is meant to improve the JavaScript so the resulting image gets better.`,
        code: `function setup() {
    createCanvas(512, 512, WEBGL);
    // ...
}

function draw() {
    // ...
}`,
        lang: 'javascript',
      },
      {
        id: 'why-p5',
        heading: 'why p5.js + p5.brush',
        body: `i wanted an environment where an LLM could produce something executable but still have a lot of artistic freedom. \`p5.js\` (p5js.org) was a natural choice.\n\nthe extra piece was \`p5.brush\` — a library for generative drawing: watercolour fills, organic strokes, textures, other brush effects. instead of asking the model to manipulate pixels directly, it has to learn how to describe a painting procedurally.`,
        code: `LLM
 ↓
code
 ↓
p5.js
 ↓
p5.brush
 ↓
image`,
        lang: 'text',
      },
      {
        id: 'what-is-rl',
        heading: 'what an rl system actually is',
        body: `one of the first realisations was that i was building an RL system before i understood what its pieces actually were. i spent time on: what is the environment? the policy? the action? where does the reward come from? where does GRPO fit? is the renderer part of the environment?\n\neventually it got clearer. the environment is the painting program. the LLM is the policy, and its action is: generate a JavaScript program. the reward is based on what happens after executing that program — is it valid JS, did it render, does it look like a rose, does it look like watercolour, does it match the reference. that distinction was one of the most important things i learned.`,
        code: `prompt
   ↓
model            (policy: generate a JS program)
   ↓
JavaScript
   ↓
validator
   ↓
renderer
   ↓
PNG
   ↓
reward           (valid? rendered? looks right? matches ref?)`,
        lang: 'text',
      },
      {
        id: 'reference-vs-output',
        heading: 'the reference image is not the model output',
        body: `i had to draw a very clear line between two things.\n\nthe reference: i can use an image generator such as Qwen to create the target painting — "loose watercolour painting of a red rose" goes to Qwen, out comes reference.png.\n\nthe model output: the RL model does not generate that image. it generates JavaScript, which is then rendered to a PNG. so the actual learning problem is the visual similarity between the reference and the generated image, where the generated image comes from JavaScript that comes from the LLM.`,
        code: `reference.png
      ↑
visual similarity
      ↓
generated.png
      ↑
JavaScript
      ↑
     LLM`,
        lang: 'text',
      },
      {
        id: 'first-pipeline',
        heading: 'the first generation pipeline',
        body: `i built a pipeline that could send a task to a model, receive JavaScript, validate it, render it, check whether the real brush library actually loaded, save the candidate, and eventually compare the image against a reference.\n\ni also wrote reproducible task descriptions — e.g. \`object_rose_01\` — with explicit requirements. that gave me a dataset instead of just asking the model random questions.`,
        code: `task: object_rose_01

single rose bloom
short curved stem
petal layers
plain warm off-white background
soft cast shadow
transparent watercolour washes
soft pigment bleeding
organic brush marks
visible paper texture`,
        lang: 'text',
      },
      {
        id: 'candidates-and-humans',
        heading: 'candidate generation and human judgement',
        body: `the next idea was to generate multiple candidates for the same painting, then choose which ones were actually good. that led to a human-labelled reference pool — LOVE / OKAY / NOPE — where the human judgement could later become training data.\n\nbecause automatic visual reward was already looking shaky, i also wanted a tiny interface: show candidate A and candidate B, pick one. before training a model to optimise a reward, i needed to know whether the reward actually rewards things i like.\n\ni wasn't trying to make one pretty picture — i was building the infrastructure for learning which programs produce better pictures.`,
        code: `             ┌─ candidate 1
             ├─ candidate 2
prompt ──────┼─ candidate 3
             ├─ candidate 4
             └─ candidate 5
                   ↓
           [ LOVE ] [ OKAY ] [ NOPE ]
                   ↓
             visual reward
                   ↓
               RL / GRPO`,
        lang: 'text',
      },
      {
        id: 'bad-reward',
        heading: 'the reward function started looking terrible',
        body: `this was one of the biggest failures. having a reward function didn't mean i had a good reward function.\n\na program could compile, render, contain \`p5.brush\`, and produce an image — and still be a terrible painting. valid code is not a good painting. a successful render is not a good painting.\n\nso i started thinking in levels: syntax, runtime, brush usage, semantic similarity, visual quality. i looked at CLIP similarity, DINO-style embeddings, LPIPS, and eventually human pairwise preferences. the key realisation: the reward is not an implementation detail — it defines what the RL system is actually trying to learn.`,
        code: `                 ┌─ syntax
                 ├─ runtime
                 ├─ brush usage
reward ──────────┤
                 ├─ semantic similarity
                 └─ visual quality`,
        lang: 'text',
      },
      {
        id: 'api-failure',
        heading: 'debugging inference: the weird api failure',
        body: `this was my most useful debugging episode. i was using OpenCode Zen as the model gateway — a curated gateway for tested models — and calling \`deepseek-v4-flash\`.\n\nmy Python candidate-generation pipeline was producing valid=false, render=false, real_brush=false, and sometimes an effectively empty \`program.js\`. it looked like "DeepSeek can't generate the code." but the same endpoint worked fine from \`curl\`.\n\nthat changed the question from "does the model work?" to "what exactly is my Python client receiving?" i added response diagnostics and found the model was spending the entire generation budget on reasoning — there was no usable JavaScript in \`message.content\` at all. DeepSeek's docs describe a thinking mode that returns the reasoning separately via \`reasoning_content\`. the lesson: always inspect the raw model response before blaming the rest of the pipeline.`,
        code: `finish_reason:              length
message_content_length:     0
reasoning_content_length:   16125
completion_tokens:          4096`,
        lang: 'text',
      },
      {
        id: 'token-budgets',
        heading: 'token budgets, reasoning, and over-constraining',
        body: `i tested several output limits. every result was empty — more tokens just meant more reasoning and still no final code.\n\nthen i tested reasoning controls. a tiny request — "return exactly: OK" with \`reasoning_effort\` set to low — returned a normal content of "OK" and a finish reason of "stop", proving the API could return \`message.content\`. but the real painting task still hit a finish reason of "length" with empty content and a huge \`reasoning_content\`.\n\ncomparing the two requests: the painting prompt carried a giant contract — 512x512 WEBGL canvas, use p5.brush, don't instantiate brush, don't use these APIs, use those APIs, watercolour, organic marks, paper texture, return only JS. the model had to reason about all of it before writing a line. new hypothesis: i had constrained the model so heavily that i was making generation unnecessarily hard.`,
        code: `max tokens   generation time   result
       512             ~8.7s    empty
       768            ~11.4s    empty
      1024            ~14.2s    empty
      2048            ~24.2s    empty
      4096             ~37s     empty`,
        lang: 'text',
      },
      {
        id: 'bad-candidates',
        heading: "the candidates were bad — and that's the real problem",
        body: `eventually i got actual candidates. they were bad — huge collections of circles, noisy red blobs, scattered brush marks, nearly empty canvases, fragmented shapes — rather than a red rose.\n\nthat was useful, because now i had a real failure mode. the problem was no longer "API doesn't work" — it was "API works, code generates, code renders, painting is bad." that is the actual RL problem.\n\nthe strange part: a single manual inference call could produce a much more beautiful painting than my controlled pipeline. that made me suspect the pipeline itself — large system prompt, strict API contract, reasoning, token limit, forced output format. i may have accidentally optimised the pipeline for validating code rather than for generating good art.`,
        code: `API works
   ↓
code generated
   ↓
code renders
   ↓
painting is bad      ← the actual RL problem`,
        lang: 'text',
      },
      {
        id: 'separate-environments',
        heading: 'separating the environments',
        body: `i had been treating "the RL environment" as one thing. splitting it made everything easier to reason about.\n\nenvironment 1 is model inference: prompt to LLM to JS. environment 2 is program validation: JS to syntax and API checks. environment 3 is rendering: JS to p5.js + p5.brush to PNG. environment 4 is evaluation: PNG plus reference to reward. environment 5 is RL training: prompt to policy to program to environment to reward to policy update.\n\ni also stopped trusting my assumed \`p5.brush\` API just because the model had been told about it. the current docs — \`brush.set()\`, \`brush.fill()\`, \`brush.line()\`, auto-init when the canvas is created, a global \`brush\` in the standalone build — are the source of truth. the better question is: is my "verified API" actually the API installed in my renderer?`,
        code: `1  inference    prompt → LLM → JS
2  validation   JS → syntax / API checks
3  rendering    JS → p5.js + p5.brush → PNG
4  evaluation   PNG + reference → reward
5  training     prompt → policy → program → env → reward → update`,
        lang: 'text',
      },
      {
        id: 'grpo',
        heading: 'grpo, coding agents, and why rl comes last',
        body: `the training idea was to use multiple candidate programs for the same prompt, so the model gets relative information — JS2 beats JS3 beats JS1 — instead of just "this program is valid". GRPO fits that naturally: generate a group of candidates, compare their rewards.\n\na coding agent is LLM to action to environment to observation to next action. RL Painter is the same, except the environment is visual and the action is potentially an entire program rather than a single shell command — which makes the reward problem much harder.\n\nbut i shouldn't start RL training until generation, rendering and reward are trustworthy. otherwise i'd just train the model to exploit a broken reward function.`,
        code: `Prompt: red rose
       │
      LLM
   ┌───┼───┐
  JS1 JS2 JS3
   │   │   │
 img img img
   │   │   │
  0.2 0.8 0.4      →   JS2 > JS3 > JS1`,
        lang: 'text',
      },
      {
        id: 'what-failed',
        heading: 'what actually failed',
        body: `looking back, these are the major failures so far.\n\nfailure 1 — starting RL too early. i was thinking about training before i had a reliable reward pipeline. build the evaluation environment first.\n\nfailure 2 — treating "valid" as "good". a program can be perfectly valid JavaScript and produce terrible art. validity is not quality.\n\nfailure 3 — trusting the adapter. my Python pipeline was effectively treating an empty model response as a candidate. preserve raw API responses and inspect them.\n\nfailure 4 — increasing \`max_tokens\` blindly. 512, 1024, 2048, 4096 didn't solve anything; it just gave the model more room to reason. understand where the tokens go first.\n\nfailure 5 — over-constraining the model. my giant prompt tried to specify artistic intent, composition, implementation, allowed APIs, forbidden APIs, rendering requirements and output format all at once. a validator should enforce constraints; the prompt doesn't need to encode every one.\n\nfailure 6 — assuming my API knowledge was correct. the actual current \`p5.brush\` documentation has to be the source of truth; verify the installed library directly.\n\nfailure 7 — confusing model capability with pipeline capability. one beautiful manual generation doesn't mean the automated system works. every transformation between prompt, model, output and renderer can degrade the result.`,
      },
      {
        id: 'what-ive-built',
        heading: "what i've actually built",
        body: `at this point RL Painter isn't just an idea — there are pieces of a real experimental system, plus the debugging and candidate-generation infrastructure around it. right now that's probably more valuable than having a trained RL model.\n\nthe next step isn't "start training the RL model." it's making the tiny loop reliable — prompt, one model call, clean JavaScript, successful render, good-looking image — then one call to ten candidates to human ranking to automatic reward, then candidate generation to validated reward to GRPO. the order matters.`,
        code: `   Task  "red rose"
        ↓
      LLM   (DeepSeek / Qwen / ...)
        ↓
   JavaScript
        ↓
    Validator
        ↓
  p5.js + p5.brush
        ↓
      PNG
        ↓
  Visual evaluation
        ↓
     Reward`,
        lang: 'text',
      },
      {
        id: 'what-i-learned',
        heading: 'what i learned',
        body: `the biggest lessons so far aren't about watercolour — they're about building AI systems.\n\nmake the output measurable. "write good code" is vague; "produce an image that receives a reward of 0.8" is measurable.\n\ndebug the interfaces. most of my biggest problems happened between components — LLM to API, API to Python, Python to validator, validator to renderer, renderer to evaluator.\n\ndon't train on a broken environment. if the reward is wrong, RL will happily optimise the wrong thing.\n\nsimple experiments beat complicated ones. the "return exactly: OK" test taught me more about the API than repeatedly running the whole painting pipeline.\n\na beautiful single example is not evidence, and ten ugly candidates don't prove the model can't paint. i need controlled experiments.\n\nconstraints have a cost. every extra rule is another thing the model has to reason about; the validator can enforce some things more reliably than a giant prompt.\n\nand RL comes last. the boring infrastructure comes first.`,
        code: `generation
   ↓
validation
   ↓
rendering
   ↓
evaluation
   ↓
reward
   ↓
only then RL`,
        lang: 'text',
      },
      {
        id: 'credits',
        heading: 'credits & resources',
        body: `a few projects and resources mattered a lot here.\n\np5.js — the creative-coding framework used as the execution environment.\n\np5.brush by Antonio Campos Uribe and contributors — the brush system for procedural watercolour-style rendering (open source, MIT).\n\nOpenCode Zen — the model gateway used for the API experiments and DeepSeek inference.\n\nDeepSeek — the coding-model experiments, particularly \`deepseek-v4-flash\`; its API docs were especially useful when debugging thinking / reasoning output.\n\nQwen — the image-generation and reference-image exploration (Qwen-Image, Qwen-Image-2.0).`,
        code: `p5.brush       github.com/acamposuribe/p5.brush
OpenCode Zen   dev.opencode.ai/docs/zen
DeepSeek API   api-docs.deepseek.com
Qwen           qwen.ai`,
        lang: 'text',
      },
      {
        id: 'current-state',
        heading: 'the current state of rl painter',
        body: `if i had to summarise the whole project in one diagram today, it would be this — and right now i'm deliberately stopping before the final arrow.\n\nthe interesting question isn't yet whether RL can improve the painter. it's whether i can build an environment where "better" actually means better. that's where RL Painter stands.`,
        code: `                RL PAINTER

             "Paint a rose"
                   │
                  LLM
                   │
              JavaScript
                   │
          p5.js + p5.brush
                   │
                  PNG
           ┌───────┴───────┐
           │               │
    Reference image   Generated image
        (Qwen)              │
           └───────┬───────┘
                   │
            Visual reward
                   │
                RL / GRPO
                   │
           Better programs?`,
        lang: 'text',
      },
    ],
  },
  {
    slug: 'gradient-descent',
    title: 'gradient descent',
    description:
      'understanding the fundamental optimization algorithm behind machine learning. from intuition to math to code.',
    image: '/lovable-uploads/gradient-descent-new.jpeg',
    cardImage: '/lovable-uploads/gradient-descent-new.jpeg',
    imagePosition: 'center',
    cardImagePosition: 'center',
    zoom: false,
    lightBg: true,
    tags: ['ml', 'math'],
    date: 'nov 2024',
    readTime: '5 min read',
    aspectRatio: 'natural',
    objectFit: 'contain',
    sections: [
      {
        id: 'best-fit-line',
        heading: "so, what's a best fit line?",
        body: `alright, so the whole point of machine learning is basically drawing a line that fits our data perfectly. imagine you're trying to guess a car's fuel efficiency based on its weight. we can plot all this on a graph.\n\nwe write the line as: \`f(x) = (w * x) + b\`\n\nhere, \`w\` is the weight (how steep the line is) and \`b\` is the bias (where the line starts on the y-axis). if we start with \`w=0\` and \`b=0\`, our line is just completely flat and wrong. gradient descent is the magic trick that moves our line from 'totally wrong' to 'spot on'.`,
        image: '/lovable-uploads/gradient-plot-internal.jpg',
      },
      {
        id: 'loss-function',
        heading: 'messing up and measuring it (mse)',
        body: `before we can fix our line, we need to know exactly how wrong it is. we use something called mean squared error (mse) for this.\n\nbasically, for every single data point, we subtract our completely wrong guess from the real answer, square it (so negative errors don't cancel out positive ones), and then take the average of all these screw-ups.\n\nthis gives us a single number — a 'badness score'. the higher the score, the worse our line is. gradient descent is just a game of trying to make this score as close to zero as possible.`,
      },
      {
        id: 'derivatives',
        heading: 'slopes and hills',
        body: `imagine our 'badness score' is a literal physical landscape with hills and valleys. we are blindfolded, standing somewhere high up on a hill, and we want to get to the lowest valley.\n\nwe do this by feeling the slope of the ground under our feet — this is the derivative! if the ground is tilting up, we walk the opposite way to go downhill.\n\nmathematically, we calculate how much the 'badness score' changes if we lightly nudge our \`w\` and \`b\` values. those nudges tell us exactly which direction is downhill.`,
      },
      {
        id: 'gradient-descent-steps',
        heading: 'taking steps downhill',
        body: `gradient descent is just doing this over and over again in a loop. we check the slope, take a step downhill, and repeat.\n\nwe update our \`w\` and \`b\` by subtracting a tiny bit of the slope. if we do this hundreds of times, our completely wrong flat line will magically snap into the perfect angle to fit our data!`,
        code: `# Python implementation
def gradient_descent(x, y, learning_rate=0.01, epochs=1000):
    w, b = 0, 0
    M = len(x)
    for _ in range(epochs):
        y_pred = w * x + b
        error = y_pred - y
        dw = (2/M) * sum(error * x)
        db = (2/M) * sum(error)
        w -= learning_rate * dw
        b -= learning_rate * db
    return w, b`,
      },
      {
        id: 'learning-rate',
        heading: 'how big should our steps be?',
        body: `there's a catch though. we have to decide how big those steps are. this size is called the learning rate (alpha).\n\nif you make the steps too massive, you literally overshoot the valley and end up bouncing back and forth on the hills forever.\n\nif you make the steps too tiny, it takes an absolute eternity to get to the bottom. finding the butter zone is part of the fun (or pain) of training these models!`,
      },
      {
        id: 'convergence',
        heading: 'when do we stop walking?',
        body: `as we walk downhill, our 'badness score' gets smaller and smaller. eventually, the slope flattens out, meaning we literally hit rock bottom (the perfect line!).\n\nwhen the score stops dropping by any meaningful amount, we say the model has converged. at this point, we just stop the loop and call it a day!`,
      },
    ],
  },
  {
    slug: 'bitcoin-server-cpp',
    title: 'bitcoin server in c++',
    description:
      'implementing a cryptocurrency server from scratch — utxo model, merkle trees, sha-256 hashing, and proof-of-work consensus. the full nakamoto stack.',
    image: '/lovable-uploads/naka.jpeg',
    tags: ['blockchain', 'c++'],
    date: 'dec 2024',
    readTime: '8 min read',
    draft: true,
    aspectRatio: 'square',
    objectFit: 'contain',
    sections: [],
  },
  {
    slug: 'agentic-ai',
    title: 'ai agents from scratch',
    description:
      'a file-by-file deep dive into a custom ai coding agent built on google gemini function calling. sandboxed file ops, subprocess execution, and a hand-wired tool registry.',
    image: '/lovable-uploads/agentic-ai-matrix.jpg',
    cardImage: '/lovable-uploads/agentic-ai-matrix.jpg',
    imagePosition: 'center',
    cardImagePosition: 'center',
    lightBg: true,
    tags: ['ai', 'gemini', 'python', 'agents'],
    date: 'apr 2026',
    readTime: '10 min read',
    draft: false,
    sections: [
      {
        id: 'what-is-the-agent',
        heading: 'what is this agent?',
        body: `this is a command-line coding agent that can inspect a project directory, modify or create files, and execute Python scripts — all driven by a Gemini model. it's not a pre-built framework like LangGraph — every piece of it is hand-wired, which makes it a great study in how function-calling with LLMs actually works under the hood.\n\nall operations are done by having the Gemini model request tool calls, which your Python code then executes, with results sent back. it's a tight loop between the model's intent and your filesystem.\n\nthe agent is organized around four tool functions (\`get_files_info\`, \`get_file_content\`, \`write_file\`, \`run_python_file\`), a tool registry (\`call_function.py\`), and a main agent loop (\`main.py\`). a self-contained \`calculator/\` project serves as the test target.`,
      },
      {
        id: 'main-py',
        heading: 'main.py — the agent entry point',
        body: `\`main.py\` is the brain of the agent — an ~86-line script that does three things: parse user input, call the Gemini API, and dispatch tool calls.\n\nthe system prompt tells the agent not to include the working directory in paths — because the Python tool functions inject it automatically. this is a key design choice: the model stays path-unaware, and the Python code enforces the sandbox.\n\nthe conversation history is maintained as a list of \`types.Content\` objects — the format the Gemini API expects for multi-turn conversations. when the model decides to use a tool, \`response.function_calls\` is populated with \`FunctionCall\` objects, each containing a \`name\` and \`args\` dict. the \`--verbose\` flag prints token usage metadata, useful for debugging and cost estimation.`,
        code: `system_prompt = """
You are a helpful AI coding agent.
When a user asks a question, make a function call plan. You can:
- List files and directories
- Get and read file content
- Write file (create or update)
- Run python file with optional args

All paths should be relative to the working directory.
The working directory is automatically injected for security reasons.
"""

parser = argparse.ArgumentParser(description="Chatbot")
parser.add_argument("user_prompt", type=str)
parser.add_argument("--verbose", action="store_true")
args = parser.parse_args()

messages = [types.Content(role="user", parts=[types.Part(text=args.user_prompt)])]

if response.function_calls:
    for function_call in response.function_calls:
        print(f"Calling: {function_call.name}({function_call.args})")
else:
    print(response.text)`,
      },
      {
        id: 'call-function',
        heading: 'call_function.py — the tool registry',
        body: `\`call_function.py\` is intentionally thin — its only job is to collect all four \`FunctionDeclaration\` schemas and expose them as a single \`types.Tool\` object. this object is passed to \`GenerateContentConfig(tools=[...])\`, telling Gemini what it can call.\n\nkeeping this separate from \`main.py\` is a clean architectural choice: adding a new tool only requires defining its schema in \`functions/\` and listing it here. the schemas are \`types.FunctionDeclaration\` objects — formal descriptions that Gemini reads to understand what each tool does and what parameters it accepts.`,
        code: `available_functions = types.Tool(
    function_declarations=[
        schema_get_files_info,
        schema_get_file_content_info,
        schema_write_file_info,
        schema_run_python_info
    ],
)`,
      },
      {
        id: 'get-files-info',
        heading: 'get_files_info — list directory contents',
        body: `given a relative \`directory\` path, this tool resolves it to an absolute path, validates it's inside the sandboxed working directory, then lists every item with its size and whether it's a folder — similar to \`ls -la\`.\n\nthe security check uses \`os.path.commonpath([work_direc_abs, direc_abs]) != work_direc_abs\`. if someone tries to pass \`../../etc\`, the resolved path escapes the working directory and the check fails. all four tools use this same pattern — no tool is a weak link.\n\nwhen \`directory=None\`, the working directory itself is used as the target. without this guard, \`os.path.join("calculator", "calculator")\` would produce a wrong path.`,
        code: `def get_files_info(working_directory, directory=None):
    work_direc_abs = os.path.abspath(working_directory)
    if directory is None:
        directory = work_direc_abs
    direc_abs = os.path.abspath(os.path.join(work_direc_abs, directory))

    if os.path.commonpath([work_direc_abs, direc_abs]) != work_direc_abs:
        return f'Error: Cannot list "{directory}" as it is outside the permitted working directory'

    if not os.path.exists(direc_abs):
        return f'Error: Directory "{direc_abs}" does not exist'

    results = []
    for content in os.listdir(direc_abs):
        content_path = os.path.join(direc_abs, content)
        results.append(f"- {content}: file_size={os.path.getsize(content_path)} bytes, is_dir={os.path.isdir(content_path)}")
    return "\\n".join(results) if results else "Directory is empty"`,
      },
      {
        id: 'get-file-content',
        heading: 'get_file_content — read a file',
        body: `reads up to 10,000 characters of a file and returns it as a string. if the file is longer, it appends \`"... [Content Truncated]"\` so the model knows it's not seeing the full file.\n\nwhy 10K chars? this is a pragmatic token budget limit. large files could bloat the context window and slow down or break the model call. 10K chars is roughly 2,500–3,000 tokens — enough for most source files.\n\nthe same \`os.path.commonpath\` security check applies here. all four tools use it consistently — the sandbox is enforced at every entry point.`,
        code: `MAX_CHAR = 10000

def get_file_content(working_directory, file_path):
    work_direc_abs = os.path.abspath(working_directory)
    filepath_abs = os.path.abspath(os.path.join(work_direc_abs, file_path))

    if os.path.commonpath([work_direc_abs, filepath_abs]) != work_direc_abs:
        return f"Error: Cannot access {filepath_abs} as it is outside the permitted working directory."

    if not os.path.isfile(filepath_abs):
        return f"Error: File '{filepath_abs}' does not exist or is not a file."

    try:
        with open(filepath_abs, "r") as f:
            file_content_string = f.read(MAX_CHAR)
            if len(file_content_string) >= MAX_CHAR:
                file_content_string += "\\n... [Content Truncated]"
            return file_content_string
    except Exception as e:
        return f"Error in reading file. The given error: {e}"`,
      },
      {
        id: 'write-file',
        heading: 'write_file — create or overwrite a file',
        body: `writes content to a file path. if the file doesn't exist, it creates it. if the parent directories don't exist — e.g., writing to \`pkg/morelorem.txt\` when \`pkg/\` doesn't exist — it calls \`os.makedirs\` to create the full directory tree automatically.\n\nthis is a destructive operation — calling it on an existing file overwrites it completely. the model is informed of this via the schema description.\n\n\`os.makedirs(parent_dir)\` handles nested paths. so \`write_file(".", "a/b/c/new.py", "...")\` creates \`a/\`, \`a/b/\`, and \`a/b/c/\` before writing. this is what lets the agent scaffold entire project structures.`,
        code: `def write_file(working_directory, file_path, content):
    work_direc_abs = os.path.abspath(working_directory)
    filepath_abs = os.path.abspath(os.path.join(work_direc_abs, file_path))
    parent_dir = os.path.dirname(filepath_abs)

    if os.path.commonpath([work_direc_abs, filepath_abs]) != work_direc_abs:
        return f"Error: Cannot access {filepath_abs} as it is outside the permitted working directory."

    if not os.path.isdir(parent_dir):
        try:
            os.makedirs(parent_dir)
        except Exception as e:
            return f"Error in creating directory. The given error: {e}"

    try:
        with open(filepath_abs, "w") as f:
            f.write(content)
        return f'Successfully wrote to "{filepath_abs}" ({len(content)} characters written)'
    except Exception as e:
        return f"Error in writing file. The given error: {e}"`,
      },
      {
        id: 'run-python-file',
        heading: 'run_python_file — execute a python script',
        body: `this is the most complex tool. it spawns a subprocess, captures its output, and returns both \`stdout\` and \`stderr\`.\n\nthe \`cwd=work_direc_abs\` parameter is critical: when the calculator's \`main.py\` does \`from pkg.calculator import Calculator\`, Python needs to find the \`pkg/\` directory relative to the current working directory. without \`cwd\`, the subprocess inherits the parent's CWD and the import fails.\n\nthree validation checks happen in order — security first, existence second, file type last. the \`args=None\` default (instead of \`[]\`) avoids the classic Python mutable default argument bug where all calls share the same list object. the 30-second timeout kills the process if it hangs — preventing infinite loops in agent-written code from blocking the agent forever.`,
        code: `def run_python_file(working_directory: str, file_path: str, args=None):
    if args is None:
        args = []

    work_direc_abs = os.path.abspath(working_directory)
    filepath_abs = os.path.abspath(os.path.join(work_direc_abs, file_path))

    if os.path.commonpath([work_direc_abs, filepath_abs]) != work_direc_abs:
        return f'Error: Cannot execute "{file_path}" as it is outside the permitted working directory.'
    if not os.path.isfile(filepath_abs):
        return f'Error: "{file_path}" does not exist or is not a file.'
    if not filepath_abs.endswith(".py"):
        return f'Error: "{file_path}" is not a Python file.'

    process_obj = subprocess.run(
        ["python3", file_path] + args,
        timeout=30,
        cwd=work_direc_abs,   # critical: allows relative imports
        capture_output=True,
        text=True
    )
    stdout = process_obj.stdout.strip()
    stderr = process_obj.stderr.strip()
    return f"STDOUT:\\n{stdout}\\nSTDERR:\\n{stderr}"`,
      },
      {
        id: 'function-calling-loop',
        heading: 'the function calling loop',
        body: `the current \`main.py\` detects function calls but doesn't yet execute them in a loop. the full pattern requires two API calls: the first tells you what the model wants to do; the second gives the model the data it asked for so it can form a final answer.\n\nthe loop works like this: send a user prompt → Gemini responds with a \`function_call\` → Python executes the function → the result is appended to \`messages\` as a \`tool\` role content → Gemini is called again with the updated history → it responds with a final text answer.\n\nthis is the fundamental pattern of function calling with any LLM — not just Gemini. higher-level frameworks like LangGraph abstract this loop away; wiring it by hand is the best way to truly understand it.`,
        code: `# The full function calling loop
while True:
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=messages,
        config=types.GenerateContentConfig(tools=[available_functions], ...)
    )
    if not response.function_calls:
        print(response.text)
        break

    for fc in response.function_calls:
        result = call_function.dispatch(fc.name, fc.args, working_directory)
        messages.append(types.Content(
            role="tool",
            parts=[types.Part.from_function_response(name=fc.name, response={"result": result})]
        ))`,
      },
      {
        id: 'key-design-decisions',
        heading: 'key design decisions',
        body: `tools inject \`working_directory\` automatically — the model stays path-unaware, and security is enforced in Python, not by the model. all four tools use the same \`os.path.commonpath\` check — consistent sandboxing with no weak links.\n\n\`subprocess.run(..., cwd=work_direc_abs)\` ensures scripts run with correct relative import paths. \`capture_output=True, text=True\` returns stdout/stderr as strings instead of bytes — no manual decoding. \`timeout=30\` prevents infinite loops in agent-written code from hanging the process.\n\nschema descriptions are written from the model's perspective — the description is effectively a prompt. it needs to be precise about constraints, parameter formats, and what "relative to the working directory" means, otherwise the model will pass wrong paths and fail silently.`,
      },
    ],
  },
  {
    slug: 'langchain-basics',
    title: 'LangChain 101',
    description:
      'from simple prompts to real LLM-powered applications',
    image: '/lovable-uploads/langchain-basics.jpg',
    cardImage: '/lovable-uploads/langchain-basics.jpg',
    imagePosition: 'center',
    cardImagePosition: 'center',
    lightBg: true,
    tags: ['ai', 'python'],
    date: 'mar 2024',
    readTime: '5 min read',
    draft: false,
    sections: [
      {
        id: 'ai-lego',
        heading: 'the ai lego set',
        body: `so you've got this powerful brain (the llm), but it's basically sitting in a dark room with no windows. langchain is the toolkit that gives it a mailbox, a telephone, and a set of instructions.\n\nit's less about the 'ai' itself and more about the 'plumbing' that connects your ai to the real world. think of it as building with lego bricks: one brick is your model, another is your data, and langchain is the baseplate that holds them all together.`,
      },
      {
        id: 'prompt-templates',
        heading: 'blueprints for prompts',
        body: `instead of manually typing out long instructions every time, we use prompt templates. think of it like 'mad-libs' for ai. you define the structure once, and langchain swaps in the variables on the fly.\n\nthis makes your app way more reliable because you aren't relying on strings you typed into a chat box — you're using a reusable blueprint.`,
        code: `from langchain_core.prompts import PromptTemplate

template = "You are a helpful assistant that explains {topic} to a 5-year-old."
prompt = PromptTemplate.from_template(template)

# Just swap in the topic!
formatted_prompt = prompt.format(topic="quantum physics")`,
      },
      {
        id: 'lcel-pipe',
        heading: "let's talk about the pipe (|)",
        body: `this is where the magic happens. using langchain expression language (lcel), we can chain components together like literal pipes. the output of your prompt flows into the model, and the model's output flows into a parser.\n\nit looks clean, it's fast, and it makes complex logic feel like a simple assembly line.`,
        code: `# The modern way to chain
chain = prompt | model | output_parser

# It just works!
response = chain.invoke({"topic": "black holes"})`,
      },
      {
        id: 'ai-memory',
        heading: 'wait, what was i saying?',
        body: `llms are naturally forgetful. they treat every message as if it's the first time they've ever met you. memory components in langchain allow the model to 'remember' the last few messages.\n\nthis is how you build chat bots that actually feel human and can refer back to things you said five minutes ago without you having to repeat yourself.`,
      },
      {
        id: 'agents-tools',
        heading: 'giving the ai a toolbelt',
        body: `agents are the 'final boss' of langchain. instead of following a fixed path, an agent looks at a goal and decides which 'tool' to use — like searching google, checking a database, or running a calculator.\n\nit's the difference between a scripted robot that only says one thing and a thinking assistant that can actually solve problems for you.`,
        code: `# Concept of an Agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_executor.invoke({"input": "What is the price of Bitcoin and how much would 0.5 BTC cost?"})`,
      },
    ],
  },
];
