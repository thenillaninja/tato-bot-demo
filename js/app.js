(() => {
  const form = document.getElementById("tato-demo-form");
  const input = document.getElementById("tato-demo-input");
  const messagesEl = document.getElementById("tato-demo-messages");
  const suggestionButtons = document.querySelectorAll("[data-question]");

  if (!form || !input || !messagesEl) return;


  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });
  }


  const demoBusiness = {
    services:
      "a customizable website assistant, normal question-and-answer support, visitor guidance, contact handoff, and optional AI integration",
    hours:
      "Tato Bot works whenever your website is available. He does not need office hours or coffee breaks.",
    phone: "",
    email: "hello@example.com",
    website: "this Tato Bot demo site",
    address: "",
    serviceArea: "your own website",
    policies:
      "Tato Bot is designed as a one-time software purchase. AI provider costs, web hosting, and other third-party services are separate if you choose to use them.",
    faqs: [
      {
        q: "How easy is Tato Bot to install?",
        a: "The goal is simple: add the included files to your website, enter your business information, customize the assistant, and go live. A step-by-step setup guide is included."
      },
      {
        q: "Do I need AI to use Tato Bot?",
        a: "No. Tato works as a focused website assistant without full AI integration. AI is optional if you want more flexible conversational responses."
      },
      {
        q: "Can I customize Tato Bot?",
        a: "Yes. You can change the assistant name, avatar, greeting, colors, business information, common questions, answers, and personality."
      },
      {
        q: "Is Tato Bot a subscription?",
        a: "No Tato Bot subscription is planned. The product is designed as a one-time software purchase."
      },
      {
        q: "What happens when Tato does not know an answer?",
        a: "Tato tells the visitor he does not have that information and can offer a direct email handoff so the question reaches a human."
      },
      {
        q: "What kind of questions can Tato answer?",
        a: "Tato is built for the things website visitors commonly search for: services, hours, contact information, policies, common questions, where to find something, and other information you provide."
      },
      {
        q: "Does Tato Bot support AI?",
        a: "Yes. Full AI integration is supported as an optional capability for businesses that want broader, more conversational responses."
      }
    ]
  };

  const stopWords = new Set([
    "about", "after", "also", "are", "can", "could", "does", "have",
    "how", "offer", "please", "tell", "that", "the", "this", "what",
    "when", "where", "which", "with", "would", "you", "your", "tato",
    "bot"
  ]);

  let history = [];

  function addMessage(text, role, extra = {}) {
    const message = document.createElement("div");
    message.className =
      "demo-message " +
      (role === "user" ? "demo-message-user" : "demo-message-bot");

    const textNode = document.createElement("div");
    textNode.textContent = text;
    message.appendChild(textNode);

    if (extra.email) {
      const link = document.createElement("a");
      const subject = encodeURIComponent("Question from the Tato Bot demo");
      const body = encodeURIComponent(
        `Hi,\n\nI asked Tato:\n\n${extra.question}\n\n`
      );

      link.className = "demo-email-button";
      link.href = `mailto:${extra.email}?subject=${subject}&body=${body}`;
      link.textContent = "Email this question";
      message.appendChild(link);
    }

    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return message;
  }

  function keywordList(text) {
    return text
      .toLowerCase()
      .replace(/[?.,!'"()]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 3 && !stopWords.has(word));
  }

  function faqReply(question) {
    const keywords = keywordList(question);
    let best = null;
    let bestScore = 0;

    demoBusiness.faqs.forEach((faq) => {
      const searchable = `${faq.q} ${faq.a}`.toLowerCase();
      const score = keywords.reduce(
        (total, word) => total + (searchable.includes(word) ? 1 : 0),
        0
      );

      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    });

    return bestScore >= 2 ? best?.a || "" : "";
  }

  function createReply(rawQuestion) {
    const question = rawQuestion.toLowerCase().trim();

    const previousUserMessage =
      [...history]
        .reverse()
        .find((item) => item.role === "user")
        ?.text.toLowerCase() || "";

    const previousAssistantMessage =
      [...history]
        .reverse()
        .find((item) => item.role === "assistant")
        ?.text.toLowerCase() || "";

    let reply = faqReply(question);

    const priorTopic =
      /install|setup|set up/.test(previousUserMessage) ||
      /install|setup|step-by-step/.test(previousAssistantMessage)
        ? "install"
        : /ai|artificial intelligence/.test(previousUserMessage) ||
          /ai integration|ai is optional/.test(previousAssistantMessage)
          ? "ai"
          : /custom|change|brand|color|avatar|name/.test(previousUserMessage) ||
            /change the assistant|customize/.test(previousAssistantMessage)
            ? "customize"
            : /service|what do you do|what can you do|features/.test(previousUserMessage) ||
              /website assistant|visitor guidance/.test(previousAssistantMessage)
              ? "services"
              : /price|cost|subscription|monthly|buy/.test(previousUserMessage) ||
                /one-time software purchase|subscription/.test(previousAssistantMessage)
                ? "pricing"
                : "";

    const shortFollowUp =
      question.split(/\s+/).filter(Boolean).length <= 6;

    if (!reply && /install|setup|set up|hard to use|easy to use/.test(question)) {
      reply =
        "Tato is designed to be straightforward to install: add the included files to your site, enter your business information, customize him, and go live. The purchase includes a step-by-step setup guide.";
    } else if (!reply && /need ai|require ai|without ai|no ai/.test(question)) {
      reply =
        "You do not need AI. Tato can answer normal business questions using the information you provide. AI is an optional upgrade when you want broader conversational responses.";
    } else if (!reply && /ai|artificial intelligence/.test(question)) {
      reply =
        "Tato supports optional AI integration, but it is not required. The normal question-and-answer mode is useful on its own.";
    } else if (!reply && /custom|change|brand|color|avatar|name|personality/.test(question)) {
      reply =
        "Yes. You can change the bot name, avatar, colors, greeting, personality, business information, questions, and answers so the assistant becomes your own.";
    } else if (!reply && /subscription|monthly|recurring/.test(question)) {
      reply =
        "Tato Bot is being designed as a one-time software purchase, not another monthly Tato subscription.";
    } else if (!reply && /price|cost|how much|buy|purchase/.test(question)) {
      reply =
        "Final launch pricing has not been posted yet, but the plan is a one-time purchase rather than a recurring Tato Bot subscription.";
    } else if (
      !reply &&
      /what services|which services|what do you do|what can you do|features|help with/.test(question)
    ) {
      reply = `Tato offers ${demoBusiness.services}.`;
    } else if (!reply && /hour|open|close|when|weekend/.test(question)) {
      reply = demoBusiness.hours;
    } else if (!reply && /website|site|online/.test(question)) {
      reply =
        "Tato is made to live directly on your website so visitors can get answers without hunting through pages.";
    } else if (!reply && /contact|email|reach|human|owner|person/.test(question)) {
      reply =
        "If Tato cannot answer something reliably, he can hand the question off by email so a real person can take over.";
    } else if (!reply && /policy|cancel|deposit|warranty/.test(question)) {
      reply = demoBusiness.policies;
    } else if (
      !reply &&
      shortFollowUp &&
      priorTopic === "install" &&
      /really|how|hard|easy|then|after/.test(question)
    ) {
      reply =
        "Yep. The whole point is to keep setup approachable. The detailed guide handles the technical steps, while most customization is simply entering your own business information.";
    } else if (
      !reply &&
      shortFollowUp &&
      priorTopic === "ai" &&
      /why|when|worth|better|more/.test(question)
    ) {
      reply =
        "AI makes sense when you want more flexible conversation. If your visitors mostly need predictable business answers, normal Tato may already be enough.";
    } else if (
      !reply &&
      shortFollowUp &&
      priorTopic === "customize" &&
      /what else|how much|everything|all of it/.test(question)
    ) {
      reply =
        "Quite a bit: name, avatar, greeting, colors, business details, FAQs, policies, contact information, and the assistant's tone.";
    } else if (
      !reply &&
      shortFollowUp &&
      priorTopic === "pricing" &&
      /why|really|forever|monthly/.test(question)
    ) {
      reply =
        "The product itself is intended to be purchased once. Separate services you choose to connect, such as AI usage or hosting, can have their own costs.";
    }

    if (!reply) {
      return {
        text:
          "I don't have that information readily available. Would you like to email the business with your question?",
        email: demoBusiness.email
      };
    }

    return { text: reply };
  }

  function answerQuestion(text) {
    const clean = text.trim();
    if (!clean) return;

    addMessage(clean, "user");

    const priorHistory = [...history];
    history.push({ role: "user", text: clean });

    const typing = addMessage("Tato is thinking...", "assistant");
    typing.classList.add("demo-message-typing");

    window.setTimeout(() => {
      typing.remove();

      // createReply should see the conversation before the current message
      history = priorHistory;
      const result = createReply(clean);

      addMessage(result.text, "assistant", {
        email: result.email,
        question: clean
      });

      history.push({ role: "user", text: clean });
      history.push({ role: "assistant", text: result.text });
    }, 550);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value;
    input.value = "";
    answerQuestion(text);
    input.focus();
  });

  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      answerQuestion(button.dataset.question || "");
    });
  });
})();
