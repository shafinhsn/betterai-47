
export const getTextOffsets = (editorElement: HTMLDivElement, node: Node, offset: number): number => {
  let currentOffset = 0;
  const walker = document.createTreeWalker(
    editorElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode === node) {
      return currentOffset + offset;
    }
    currentOffset += currentNode.textContent?.length || 0;
    currentNode = walker.nextNode();
  }
  return offset;
};

export const saveSelection = (
  editorElement: HTMLDivElement,
  scrollAreaElement: HTMLDivElement | null
): {
  startOffset: number;
  endOffset: number;
  node: Node | null;
  scrollTop: number;
} | null => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const startOffset = getTextOffsets(editorElement, range.startContainer, range.startOffset);
  const endOffset = getTextOffsets(editorElement, range.endContainer, range.endOffset);

  return {
    startOffset,
    endOffset,
    node: range.startContainer,
    scrollTop: scrollAreaElement?.scrollTop || 0
  };
};

export const restoreSelection = (
  editorElement: HTMLDivElement,
  scrollAreaElement: HTMLDivElement | null,
  savedSelection: {
    startOffset: number;
    endOffset: number;
    node: Node | null;
    scrollTop: number;
  }
): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  let currentOffset = 0;
  let startFound = false;
  let endFound = false;

  const walker = document.createTreeWalker(
    editorElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node = walker.nextNode();
  while (node && (!startFound || !endFound)) {
    const nodeLength = node.textContent?.length || 0;

    if (!startFound && currentOffset + nodeLength >= savedSelection.startOffset) {
      range.setStart(node, savedSelection.startOffset - currentOffset);
      startFound = true;
    }

    if (!endFound && currentOffset + nodeLength >= savedSelection.endOffset) {
      range.setEnd(node, savedSelection.endOffset - currentOffset);
      endFound = true;
    }

    currentOffset += nodeLength;
    node = walker.nextNode();
  }

  if (scrollAreaElement && savedSelection.scrollTop) {
    scrollAreaElement.scrollTop = savedSelection.scrollTop;
  }

  try {
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    console.error('Error restoring selection:', error);
  }
};
