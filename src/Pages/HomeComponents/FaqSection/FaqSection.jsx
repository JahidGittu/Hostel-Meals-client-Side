import React, { useState } from "react";

const faqData = [
  {
    question: "What is the preparation time for each meal?",
    answer:
      "Preparation time varies by meal. Typically, breakfast takes 15-20 minutes, lunch 25-35 minutes, and dinner 30-45 minutes.",
  },
  {
    question: "Can I customize my order?",
    answer:
      "Yes! You can request customizations in the 'Special Instructions' section during checkout.",
  },
  {
    question: "Do you provide home delivery?",
    answer:
      "Absolutely! We deliver to most locations within the city. Delivery times depend on your location.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "If your order is incorrect or delayed beyond the promised time, you are eligible for a full refund.",
  },
  {
    question: "Are the meals healthy?",
    answer:
      "Yes! All meals are prepared with fresh ingredients and balanced nutrition in mind.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(null); // close if already open
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
        ❓ Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none bg-base-200 transition"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-medium text-base md:text-lg">{faq.question}</span>
              <span className="text-primary font-bold text-xl">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-base-300 text-base-content text-sm md:text-base transition-all">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
