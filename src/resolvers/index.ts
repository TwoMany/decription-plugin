import api, { route } from '@forge/api'; 
import Resolver, { Request } from '@forge/resolver'; 
import { Component, TextNode } from '../types/types'; 

const resolver = new Resolver(); 

// Type guard to check if a component is a TextNode
const isTextNode = (component: Component): component is TextNode => component.type === 'text';

// Define a resolver function to get issue data
resolver.define('getIssueData', async (req: Request) => {
  const issueId = req.payload?.issueId; // Extract issueId from the request payload
  return fetchIssueDescription(issueId); // Fetch the issue description based on the issueId
});

// Define a resolver function to apply changes to the issue
resolver.define('applyChanges', async (req: Request) => {
  const issueId = req.payload?.issueId; // Extract issueId from the request payload
  const replacedDescription = req.payload?.replacedDescription; // Extract the modified description
  return applyChanges(issueId, replacedDescription); // Apply changes using the issueId and description
});

// Dictionary mapping original phrases to their replacements
const dictionary: Map<string, string> = new Map([
  ["stupid", "imperfect"],
  ["dumb", "deficient"],
  ["piece of shit", "solution"],
  ["sick of", "considering stopping investing time in"],
  ["idiots", "inexperienced people"]
]);

// Function to fetch the issue description using the Jira API
const fetchIssueDescription = async (issueId: string): Promise<Component> => {
  // Make a request to the Jira API to get the issue data
  const issueResponse = await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}`, {
    headers: {
      'Accept': 'application/json' // Request JSON response
    }});
  const issue = await issueResponse.json(); // Parse the response as JSON

  const description: Component = issue.fields?.description; // Get the issue description from the response

  traceDocument(description); // Process the description to replace words
  return description; // Return the modified description
};

// Function to recursively trace the document and replace words
const traceDocument = (component: Component): void => {
  if(isTextNode(component)) { // Check if the component is a TextNode
    component.text = replaceWords(component.text); // Replace words in the text
  } else {
    // If not a TextNode, recursively process each subcomponent
    component.content?.forEach((subComponent) => 
      traceDocument(subComponent)
    );
  }
};

// Function to replace words in a given text based on the dictionary
const replaceWords = (text: string): string => {
  // Loop through each entry in the dictionary
  for(const [originalPhrase, replacementPhrase] of dictionary) {
    const regex = new RegExp(originalPhrase, "gi"); // Create a regex for the original phrase
    text = text.replace(regex, replacementPhrase); // Replace occurrences in the text
  }

  return text; // Return the modified text
};

// Function to apply changes to the issue description
const applyChanges = async (issueId: string, replacedDescription: Component): Promise<void> => {
  await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}`, {
    method: 'PUT', // Set the method to PUT to update the resource
    body: JSON.stringify({
      fields: {
        description: replacedDescription // Set the modified description in the request body
      }
    }),
    headers: {
      'Content-Type': 'application/json' // Indicate the content type of the request body
    }
  });
};

export default resolver; // Export the resolver for use in other modules
