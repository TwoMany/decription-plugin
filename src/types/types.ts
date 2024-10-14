// Base interface representing a generic node in the document
export interface Node {
  type: string; // The type of the node (e.g., 'paragraph', 'text', etc.)
  version?: number; // Optional version number for the node
  content?: Component[]; // Optional content which is an array of child components
  marks?: unknown; // Optional property to hold additional formatting marks
  attrs?: unknown; // Optional property for additional attributes
}

// Interface representing a text node, which contains a string of text
export interface TextNode {
  type: 'text'; // Fixed type indicating this is a text node
  text: string; // The actual text content of the node
  marks?: unknown; // Optional property for any formatting marks associated with the text
}

// Union type representing either a Node or a TextNode
export type Component = Node | TextNode;

// Interface for a hard break node, indicating a line break in the content
export interface HardBreakNode {
  type: 'hardBreak'; // Fixed type indicating this is a hard break node
}

// Interface representing a paragraph node, which can contain text and hard breaks
export interface ParagraphNode {
  type: 'paragraph'; // Fixed type indicating this is a paragraph node
  content: (TextNode | HardBreakNode)[]; // Array of text and/or hard break nodes that make up the paragraph
}

// Interface for a rendering component that can contain various types of nodes
export interface RenderingComponent {
  type: string; // The type of the rendering component (e.g., 'block', 'inline')
  content?: (TextNode | HardBreakNode | ParagraphNode)[]; // Optional array of child nodes (text, hard breaks, paragraphs)
}

// Interface representing the root document node, which holds the overall structure of the document
export interface DocumentNode {
  type: 'doc'; // Fixed type indicating this is a document node
  version: number; // Version number of the document structure
  content: ParagraphNode[]; // Array of paragraph nodes that form the content of the document
}

// Interface for the props of the ApplyButton component, which includes an onClick handler
export interface ApplyButtonExampleProps {
  onClick: () => void; // Function to handle click events for the apply button
}
