import { useState } from "react";
import axios from "axios";

function QuestionGenerator() {

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    subtopic: "",
    difficulty: "medium",
    questionCount: 5
  });

  const [questions, setQuestions] = useState([]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const generateQuestions = async () => {

    try {

      const response = await axios.post(
        "http://localhost:5000/api/questions/generate",
        form
      );

      setQuestions(
        response.data.questions
      );

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <div>

      <input
        name="subject"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
      />

      <input
        name="topic"
        placeholder="Topic"
        value={form.topic}
        onChange={handleChange}
      />

      <input
        name="subtopic"
        placeholder="Subtopic"
        value={form.subtopic}
        onChange={handleChange}
      />

      <select
        name="difficulty"
        value={form.difficulty}
        onChange={handleChange}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        type="number"
        name="questionCount"
        value={form.questionCount}
        onChange={handleChange}
      />

      <button onClick={generateQuestions}>
        Generate Questions
      </button>

      {questions.map((q, index) => (

        <div key={index}>

          <h3>
            {index + 1}. {q.question}
          </h3>

          {q.options.map((option, i) => (
            <p key={i}>
              {String.fromCharCode(65 + i)}. {option}
            </p>
          ))}

        </div>

      ))}

    </div>
  );
}

export default QuestionGenerator;