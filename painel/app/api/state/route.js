import { NextResponse } from "next/server";

const REPO = "bebamaat/maat-virtual";
const FILE_PATH = "painel/data/state.json";
const BRANCH = "main";

async function getGitHubFile() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
  return { content, sha: data.sha };
}

async function putGitHubFile(content, sha) {
  const body = {
    message: "Atualizar estado do painel (via painel web)",
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT error: ${res.status} ${err}`);
  }
  return res.json();
}

function getDefaultState() {
  return { completedTasks: [], questions: [] };
}

export async function GET() {
  try {
    const { content } = await getGitHubFile();
    return NextResponse.json(content || getDefaultState());
  } catch (e) {
    return NextResponse.json(getDefaultState());
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    const { content: current, sha } = await getGitHubFile();
    const state = current || getDefaultState();

    if (action === "toggleTask") {
      const { taskId } = body;
      if (state.completedTasks.includes(taskId)) {
        state.completedTasks = state.completedTasks.filter((id) => id !== taskId);
      } else {
        state.completedTasks.push(taskId);
      }
    } else if (action === "answerQuestion") {
      const { questionId, answer } = body;
      const q = state.questions.find((q) => q.id === questionId);
      if (q) {
        q.answer = answer;
        q.answeredAt = new Date().toISOString();
        q.status = "answered";
      }
    } else if (action === "addQuestion") {
      const { id, from, to, question } = body;
      state.questions.push({
        id,
        from,
        to,
        question,
        answer: null,
        status: "pending",
        createdAt: new Date().toISOString(),
        answeredAt: null,
      });
    }

    await putGitHubFile(state, sha);
    return NextResponse.json(state);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
