import React from 'react';
import { render, Fragment, Text } from '@forge/ui';
import { Button } from "@forge/react";
import ForgeReconciler, { useProductContext } from '@forge/react';
import { invoke, view, events } from '@forge/bridge';
import {
  ParagraphNode,
  RenderingComponent,
  DocumentNode,
  ApplyButtonExampleProps,
} from '../types/types'; 

// Component for the apply button
const ApplyButton: React.FC<ApplyButtonExampleProps> = ({ onClick }) => {
  return (
    <Button appearance="primary" onClick={onClick}>
      Apply
    </Button>
  );
};

// Function to render the content of the issue description
function RenderContent({ content }: { content: ParagraphNode[] }) {
  return (
    <>
      {content.map((block, index) => (
        <Text key={index}>
          {block.content.map((item, idx) => (
            <React.Fragment key={idx}>
              {/* Display text and hard breaks */}
              {item.type === 'text' && item.text}
              {item.type === 'hardBreak' && <Text>{"\n"}</Text>}
            </React.Fragment>
          ))}
        </Text>
      ))}
    </>
  );
}

// Function to convert a RenderingComponent into a DocumentNode format
const convertComponentToDocumentNode = (component: RenderingComponent): DocumentNode => {
  // Transform the component's content into a DocumentNode structure
  const transformedContent = component.content?.map((block: any) => ({
    type: block.type,
    content: block.content?.map((child: any) => {
      // Map different child types to the corresponding structure
      if (child.type === 'text') {
        return { type: 'text', text: child.text };
      } else if (child.type === 'hardBreak') {
        return { type: 'hardBreak' };
      } else {
        return {}; // Return an empty object for unknown types
      }
    }),
  })) || [];

  // Return the final DocumentNode structure
  return {
    type: 'doc',
    version: 1,
    content: transformedContent,
  };
};

const App = () => {
  // Use the product context to access issue data
  const context = useProductContext();
  // State to hold the modified issue description
  const [replacedDescription, setReplacedIssueDescription] = React.useState<RenderingComponent>();
  // State to hold the issue ID
  const [issueId, setIssueId] = React.useState<string>('');
  // State to hold the document node for rendering
  const [documentNode, setDocumentNode] = React.useState<DocumentNode | null>(null);

  // Function to fetch issue data using the issue ID
  const fetchIssueData = async (issueId: string) => {
    try {
      // Invoke the backend function to get issue data
      const replacedIssueDescription: RenderingComponent = await invoke('getIssueData', { issueId }); 
      if ('content' in replacedIssueDescription) {
        // Convert the fetched description into a DocumentNode
        const documentNode = convertComponentToDocumentNode(replacedIssueDescription);
        setDocumentNode(documentNode);
      } else {
        console.error('Invalid component structure', replacedIssueDescription);
      }
  
      // Update the state with the new description
      setReplacedIssueDescription(replacedIssueDescription);
    } catch (error) {
      console.error('Error fetching issue data:', error);
    }
  };

  // Function to apply changes to the issue
  const onApplyChanges = async () => {
    try {
      // Invoke the backend function to apply changes
      await invoke('applyChanges', { replacedDescription, issueId });
      // Refresh the view to reflect the changes
      view.refresh();
    } catch (error) {
      console.error('Error applying changes:', error);
    }
  };

  // Use effect to run when the component mounts or the context changes
  React.useEffect(() => {
    if (context) {
      const issueId = context.extension.issue.id; // Get the current issue ID from context
      setIssueId(issueId);
      fetchIssueData(issueId); // Fetch initial issue data
      
      // Listen for issue changes and refetch data when changes occur
      events.on('JIRA_ISSUE_CHANGED', (data) => {
        fetchIssueData(issueId);
      });
    }
  }, [context]);

  return (
    <>
      {documentNode && <RenderContent content={documentNode.content} />} {/* Render issue content if available */}
      <ApplyButton onClick={onApplyChanges} /> {/* Render the apply button */}
    </>
  );
};

// Render the App component using ForgeReconciler
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
