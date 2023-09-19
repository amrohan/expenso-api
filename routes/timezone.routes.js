const setTimeZone = async (request, reply) => {
  try {
    const { timezone } = req.body;
    if (timezone == undefined)
      return reply.status(400).send({ message: "Please select a timezone" });

    // Set the 'timezone' cookie with the selected timezone
    reply.cookie("timezone", timezone, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    reply.header("set-timezone", "Asia/Kolkata");

    reply.status(200).send({ message: "Timezone set successfully" });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: error.message });
  }
};

const getTimeZone = async (req, reply) => {
  const timezone = reply.getHeader("set-timezone");
  if (timezone == undefined)
    return reply.status(400).json({ message: "Please select a timezone" });

  reply.status(200).json({ timezone });
};

export { getTimeZone, setTimeZone };
