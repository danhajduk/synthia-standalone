export function getGreeting() {
    const now = new Date();
    const hour = now.getHours();
  
    const morningGreetings = [
      "Good morning, Dan.",
      "Morning, Dan.",
      "Rise and shine, Dan.",
      "A bright morning to you, Dan.",
    ];
  
    const afternoonGreetings = [
      "Good afternoon, Dan.",
      "Hello, Dan.",
      "Hope your day’s going well, Dan.",
      "Afternoon, Dan.",
    ];
  
    const eveningGreetings = [
      "Good evening, Dan.",
      "Evening, Dan.",
      "Hope you had a good day, Dan.",
      "Welcome back, Dan.",
    ];
  
    if (hour < 12) return randomFrom(morningGreetings);
    if (hour < 18) return randomFrom(afternoonGreetings);
    return randomFrom(eveningGreetings);
  }
  
  export function getSummaryLine() {
    const summaries = [
      "I've prepared your assistant summary below.",
      "Here’s what I’ve gathered for you today.",
      "Your status overview is ready.",
      "Here's your latest assistant update.",
      "Everything is synced and ready to review.",
      "Your insights are waiting below.",
      "This is what I have for you now.",
      "Your assistant has finished compiling updates.",
      "I’ve gathered everything important for you.",
      "Take a look at your current status.",
      "Here's your current summary, Dan.",
      "I've assembled your latest insights.",
      "Ready when you are — here’s the summary.",
      "Latest intel is ready below.",
      "Here’s your organized summary, Dan.",
      "All your modules have been reviewed.",
      "Just finished gathering your updates.",
      "You're all synced up. Summary below.",
      "I've got the latest ready to go.",
      "Here's your personalized assistant digest.",
    ];
  
    return randomFrom(summaries);
  }
  
  function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  