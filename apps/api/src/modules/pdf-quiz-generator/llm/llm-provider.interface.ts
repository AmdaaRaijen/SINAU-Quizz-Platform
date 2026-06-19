export interface LlmProvider {
  generateQuestionSet(markdown: string): Promise<string>;
}
