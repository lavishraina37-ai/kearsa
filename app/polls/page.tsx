function PollOptions({
  pollId,
  vote,
}: {
  pollId: string;
  vote: (q: string, o: string) => void;
}) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("poll_options")
        .select("*")
        .eq("question_id", pollId);

      if (error) console.log("Options error:", error);

      setOptions(data || []);
    };

    load();
  }, [pollId]);

  return (
    <div>
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => vote(pollId, opt.id)}
          style={{ marginRight: 10 }}
        >
          {opt.option_text}
        </button>
      ))}
    </div>
  );
}
