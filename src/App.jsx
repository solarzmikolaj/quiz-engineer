import { useState, useCallback } from "react";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import questionsData from "../questions.json";

const VIEWS = { HOME: "home", QUIZ: "quiz", RESULTS: "results" };

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [view, setView] = useState(VIEWS.HOME);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const startQuiz = useCallback((count) => {
    const shuffled = shuffleArray(questionsData.questions);
    const selected = shuffled.slice(0, count).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    setQuizQuestions(selected);
    setAnswers([]);
    setView(VIEWS.QUIZ);
  }, []);

  const finishQuiz = useCallback((userAnswers) => {
    setAnswers(userAnswers);
    setView(VIEWS.RESULTS);
  }, []);

  const goHome = useCallback(() => setView(VIEWS.HOME), []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={goHome}
            className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            Quiz Engineer
          </button>
          <span className="text-sm text-slate-400 hidden sm:inline">
            Bazy Danych
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
        {view === VIEWS.HOME && (
          <Home
            totalQuestions={questionsData.questions.length}
            onStart={startQuiz}
          />
        )}
        {view === VIEWS.QUIZ && (
          <Quiz questions={quizQuestions} onFinish={finishQuiz} />
        )}
        {view === VIEWS.RESULTS && (
          <Results
            questions={quizQuestions}
            answers={answers}
            onRestart={() => startQuiz(quizQuestions.length)}
            onHome={goHome}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        Quiz Engineer &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
