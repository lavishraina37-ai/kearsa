useEffect(() => {
  const channel = supabase
    .channel("votes-live")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "votes",
      },
      (payload) => {
        const vote = payload.new;

        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== vote.question_id) return q;

            return {
              ...q,
              options: q.options.map((opt) =>
                opt.id === vote.option_id
                  ? { ...opt, votes: opt.votes + 1 }
                  : opt
              ),
            };
          })
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);