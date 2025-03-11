
export const determineRequestType = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('delete') || lowerInput.includes('remove')) {
    return 'document_remove';
  } else if (lowerInput.includes('keep only') || lowerInput.includes('retain only')) {
    return 'document_filter';
  } else if (lowerInput.includes('add') || lowerInput.includes('write') || lowerInput.includes('insert')) {
    return 'document_add';
  } else if (lowerInput.includes('rewrite') || lowerInput.includes('change')) {
    return 'document_rewrite';
  } else if (lowerInput.includes('format') || lowerInput.includes('mla') || lowerInput.includes('apa')) {
    return 'document_format';
  } else if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
    return 'document_summarize';
  } else if (lowerInput.includes('modify')) {
    return 'document_modify';
  } else {
    return 'chat';
  }
};

export const extractOperationType = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('first word') || lowerInput.includes('only the first word')) {
    return 'keep_first_word';
  } else if (lowerInput.includes('after') && lowerInput.includes('word')) {
    return 'add_after_word';
  } else if (lowerInput.includes('paragraph')) {
    return 'paragraph_operation';
  } else if (lowerInput.includes('sentence')) {
    return 'sentence_operation';
  } else if (lowerInput.includes('first') || lowerInput.includes('beginning')) {
    return 'begin_operation';
  } else if (lowerInput.includes('last') || lowerInput.includes('end')) {
    return 'end_operation';
  } else if (lowerInput.includes('randomly') || lowerInput.includes('random')) {
    return 'random_operation';
  } else {
    return 'full_document';
  }
};

export const extractTargetInfo = (input: string, documentContent: string): any => {
  const lowerInput = input.toLowerCase();
  const targetInfo: any = {};
  
  if (lowerInput.includes('after')) {
    const afterMatch = lowerInput.match(/after\s+(?:the\s+)?(?:word\s+)?["']?(\w+)["']?/i);
    if (afterMatch && afterMatch[1]) {
      targetInfo.afterWord = afterMatch[1];
    }
  }
  
  if (lowerInput.includes('keep') || lowerInput.includes('retain')) {
    if (lowerInput.includes('first word')) {
      targetInfo.keepType = 'first_word';
    }
  }
  
  if (lowerInput.includes('random') && (lowerInput.includes('word') || lowerInput.includes('words'))) {
    targetInfo.randomType = 'words';
    const numMatch = lowerInput.match(/(\d+)\s+(?:random\s+)?words?/i);
    if (numMatch && numMatch[1]) {
      targetInfo.wordCount = parseInt(numMatch[1], 10);
    } else {
      targetInfo.wordCount = 2;
    }
  }
  
  return targetInfo;
};

export const requestTypeToMessage = (requestType: string): string => {
  switch (requestType) {
    case 'document_rewrite':
      return "Your document has been rewritten as requested.";
    case 'document_format':
      return "Your document has been reformatted.";
    case 'document_filter':
      return "Your document has been filtered to the specified content.";
    case 'document_summarize':
      return "Your document has been summarized.";
    case 'document_add':
      return "Content has been added to your document.";
    case 'document_remove':
      return "Content has been removed from your document.";
    case 'document_modify':
      return "Your document has been modified as requested.";
    default:
      return "The document has been modified based on your request.";
  }
};
