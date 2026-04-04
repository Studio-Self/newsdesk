import { Command } from "commander";
import { onboard } from "./commands/onboard.js";

const program = new Command();

program
  .name("newsdesk")
  .description("AI-powered newsroom orchestration platform")
  .version("0.1.0");

program
  .command("onboard")
  .description("Set up and start Newsdesk in one command")
  .option("--yes", "Accept all defaults (no prompts)")
  .option("--dir <path>", "Installation directory", "newsdesk")
  .action(onboard);

program.parse();
