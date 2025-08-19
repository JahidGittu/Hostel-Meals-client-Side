const FaqSection = ({ faqs }) => {
  return (
    <section className="my-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">❓ Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-md font-medium">
              {faq.question}
            </div>
            <div className="collapse-content text-sm">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
