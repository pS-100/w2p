const TopicCoverage =
  require("../models/TopicCoverage");


const createOrUpdateCoverage =
  async ({
    userId,
    subject,
    topic,
    subtopic,
    concepts,
  }) => {

    let coverage =
      await TopicCoverage.findOne({
        userId,
        subject,
        topic,
        subtopic,
      });


    if (!coverage) {
      coverage =
        await TopicCoverage.create({
          userId,
          subject,
          topic,
          subtopic,

          concepts: concepts.map(
            (concept) => ({
              concept:
                typeof concept === "string"
                  ? concept
                  : concept.concept,

              questionCountGenerated:
                typeof concept === "string"
                  ? 0
                  : concept.questionCount,

              assessed: false,
            })
          ),
        });

      return coverage;
    }


    // Add newly discovered concepts
    for (
      const concept
      of concepts
    ) {
      const conceptName =
        typeof concept === "string"
          ? concept
          : concept.concept;

      const exists =
        coverage.concepts.some(
          (item) =>
            item.concept ===
            conceptName
        );

      if (!exists) {
        coverage.concepts.push({
          concept: conceptName,

          questionCountGenerated:
            typeof concept === "string"
              ? 0
              : concept.questionCount,

          assessed: false,
        });
      }
    }


    await coverage.save();

    return coverage;
  };


const markConceptsGenerated =
  async ({
    coverageId,
    conceptPlan,
  }) => {

    const coverage =
      await TopicCoverage.findById(
        coverageId
      );

    if (!coverage) {
      throw new Error(
        "Topic coverage not found."
      );
    }


    for (
      const planned
      of conceptPlan
    ) {
      const item =
        coverage.concepts.find(
          (concept) =>
            concept.concept ===
            planned.concept
        );

      if (item) {
        item.questionCountGenerated +=
          planned.questionCount;

        item.assessed = true;
      }
    }


    await coverage.save();

    return coverage;
  };


const getRemainingConcepts =
  async ({
    coverageId,
  }) => {

    const coverage =
      await TopicCoverage.findById(
        coverageId
      );

    if (!coverage) {
      throw new Error(
        "Topic coverage not found."
      );
    }

    return coverage.concepts
      .filter(
        (concept) =>
          !concept.assessed
      )
      .map(
        (concept) =>
          concept.concept
      );
  };


module.exports = {
  createOrUpdateCoverage,
  markConceptsGenerated,
  getRemainingConcepts,
};