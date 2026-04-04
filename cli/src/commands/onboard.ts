import { execSync, spawn } from "node:child_process";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";

interface OnboardOptions {
  yes?: boolean;
  dir?: string;
}

function log(msg: string) {
  console.log(`  ${msg}`);
}

function banner() {
  console.log();
  console.log(
    pc.bold(`  ┌─────────────────────────────────────┐`)
  );
  console.log(
    pc.bold(`  │                                     │`)
  );
  console.log(
    pc.bold(`  │   ${pc.cyan("NEWSDESK")}                          │`)
  );
  console.log(
    pc.bold(`  │   AI Newsroom Orchestration         │`)
  );
  console.log(
    pc.bold(`  │                                     │`)
  );
  console.log(
    pc.bold(`  └─────────────────────────────────────┘`)
  );
  console.log();
}

function run(cmd: string, cwd: string) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function hasPnpm(): boolean {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasGit(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function onboard(opts: OnboardOptions) {
  banner();

  const dir = resolve(opts.dir ?? "newsdesk");
  const isExisting = existsSync(resolve(dir, "package.json"));

  // Check prerequisites
  if (!hasGit()) {
    console.error(pc.red("  ✗ git is required but not found. Install git and try again."));
    process.exit(1);
  }

  if (!hasPnpm()) {
    log("Installing pnpm...");
    try {
      execSync("corepack enable", { stdio: "inherit" });
    } catch {
      console.error(
        pc.red("  ✗ pnpm is required. Run: corepack enable")
      );
      process.exit(1);
    }
  }

  // Clone or reuse existing directory
  if (isExisting) {
    log(pc.dim(`Using existing installation at ${dir}`));
  } else {
    log(`Cloning into ${pc.cyan(dir)}...`);
    run(
      `git clone --depth 1 https://github.com/studio-self/newsdesk.git "${dir}"`,
      process.cwd()
    );
    log(pc.green("✓ Cloned"));
  }

  // Install dependencies
  log("Installing dependencies...");
  run("pnpm install", dir);
  log(pc.green("✓ Dependencies installed"));

  // Ensure .env exists (don't overwrite)
  const envPath = resolve(dir, ".env");
  if (!existsSync(envPath)) {
    writeFileSync(envPath, "# Add your Anthropic API key to enable AI agents\n# ANTHROPIC_API_KEY=sk-ant-...\n");
    log(pc.dim("Created .env (API key optional — add later to enable agents)"));
  } else {
    log(pc.dim("Existing .env preserved"));
  }

  // Start the server
  console.log();
  log(pc.bold("Starting Newsdesk..."));
  console.log();

  const child = spawn("pnpm", ["dev"], {
    cwd: dir,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(pc.red(`Failed to start: ${err.message}`));
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}
