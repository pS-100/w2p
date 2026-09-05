import { useState } from "react";

export default function Form() {
  const [inputs, setInputs] = useState({});
  const [selectedLevel, setSelectedLevel] = useState("easy");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "level") {
      setSelectedLevel(value);
    } else {
      setInputs(values => ({
        ...values,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Subject:", inputs.subject);
    console.log("Topic:", inputs.topic);
    console.log("Level:", selectedLevel);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="subject"
        value={inputs.subject || ""}
        onChange={handleChange}
        placeholder="enter subject"
      />
      <br />
      <br />

      <input
        type="text"
        name="topic"
        value={inputs.topic || ""}
        onChange={handleChange}
        placeholder="enter topic"
      />
      <br />
      <br />

      <label>
        <input
          type="radio"
          name="level"
          value="easy"
          checked={selectedLevel === "easy"}
          onChange={handleChange}
        />
        Easy
      </label>

      <label>
        <input
          type="radio"
          name="level"
          value="difficult"
          checked={selectedLevel === "difficult"}
          onChange={handleChange}
        />
        Difficult
      </label>
      <br />
      <br />

      <button type="submit">Submit</button>
    </form>
  );
}




