import { useState, useEffect } from 'react';

interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

interface UseMCPDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * A hook to fetch data from an MCP (Model Context Protocol) server resource.
 * This is a conceptual implementation demonstrating how to integrate MCP data with the table.
 *
 * @param client The MCP client instance (mocked interface here)
 * @param resourceUri The URI of the resource to fetch
 * @param transform A function to transform the raw MCP resource content into table data
 */
export function useMCPData<T>(
  client: { readResource: (uri: string) => Promise<{ contents: MCPResource[] }> },
  resourceUri: string,
  transform: (content: string) => T[],
): UseMCPDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await client.readResource(resourceUri);
      const content = result.contents[0]?.text;
      if (content) {
        const parsedData = transform(content);
        setData(parsedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch MCP data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceUri]);

  return { data, isLoading, error, refresh: fetchData };
}
