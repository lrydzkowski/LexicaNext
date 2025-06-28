// Mock API service based on the OpenAPI specification
export interface EntryDto {
  word: string;
  wordType: string;
  translations: string[];
}

export interface SetRecordDto {
  setId: string;
  name: string;
  createdAt: string;
}

export interface GetSetResponse {
  setId: string;
  name: string;
  entries: EntryDto[];
  createdAt: string;
}

export interface GetSetsResponse {
  count: number;
  data: SetRecordDto[];
}

export interface CreateSetRequestPayload {
  setName: string;
  entries: EntryDto[];
}

export interface UpdateSetRequestPayload {
  setName: string;
  entries: EntryDto[];
}

// Mock data
const mockSets: GetSetResponse[] = [
  {
    setId: '1',
    name: 'Common Verbs',
    createdAt: '2024-01-15T10:30:00Z',
    entries: [
      { word: 'run', wordType: 'verb', translations: ['biec', 'biegać'] },
      { word: 'jump', wordType: 'verb', translations: ['skakać', 'skoczyć'] },
      { word: 'walk', wordType: 'verb', translations: ['iść', 'chodzić'] },
      { word: 'speak', wordType: 'verb', translations: ['mówić', 'rozmawiać'] },
      { word: 'listen', wordType: 'verb', translations: ['słuchać'] },
    ],
  },
  {
    setId: '2',
    name: 'Animals',
    createdAt: '2024-01-20T14:15:00Z',
    entries: [
      { word: 'dog', wordType: 'noun', translations: ['pies'] },
      { word: 'cat', wordType: 'noun', translations: ['kot'] },
      { word: 'bird', wordType: 'noun', translations: ['ptak'] },
      { word: 'fish', wordType: 'noun', translations: ['ryba'] },
      { word: 'elephant', wordType: 'noun', translations: ['słoń'] },
    ],
  },
  {
    setId: '3',
    name: 'Colors',
    createdAt: '2024-01-25T09:45:00Z',
    entries: [
      { word: 'red', wordType: 'adjective', translations: ['czerwony'] },
      { word: 'blue', wordType: 'adjective', translations: ['niebieski'] },
      { word: 'green', wordType: 'adjective', translations: ['zielony'] },
      { word: 'yellow', wordType: 'adjective', translations: ['żółty'] },
      { word: 'purple', wordType: 'adjective', translations: ['fioletowy'] },
    ],
  },
];

export const api = {
  // Get all sets with pagination, sorting, and searching
  getSets: async (params?: {
    page?: number;
    pageSize?: number;
    sortingFieldName?: string;
    sortingOrder?: 'asc' | 'desc';
    searchQuery?: string;
  }): Promise<GetSetsResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    let filteredSets = mockSets;

    // Apply search filter
    if (params?.searchQuery) {
      filteredSets = filteredSets.filter((set) => set.name.toLowerCase().includes(params.searchQuery!.toLowerCase()));
    }

    // Apply sorting
    if (params?.sortingFieldName) {
      filteredSets.sort((a, b) => {
        const aValue = a[params.sortingFieldName as keyof SetRecordDto] as string;
        const bValue = b[params.sortingFieldName as keyof SetRecordDto] as string;

        if (params.sortingOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // Apply pagination
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      count: filteredSets.length,
      data: filteredSets.slice(startIndex, endIndex).map((set) => ({
        setId: set.setId,
        name: set.name,
        createdAt: set.createdAt,
      })),
    };
  },

  // Get single set by ID
  getSet: async (setId: string): Promise<GetSetResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const set = mockSets.find((s) => s.setId === setId);
    if (!set) {
      throw new Error('Set not found');
    }

    return set;
  },

  // Create new set
  createSet: async (payload: CreateSetRequestPayload): Promise<{ setId: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newSet: GetSetResponse = {
      setId: Math.random().toString(36).substr(2, 9),
      name: payload.setName,
      entries: payload.entries,
      createdAt: new Date().toISOString(),
    };

    mockSets.push(newSet);

    return { setId: newSet.setId };
  },

  // Update existing set
  updateSet: async (setId: string, payload: UpdateSetRequestPayload): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const setIndex = mockSets.findIndex((s) => s.setId === setId);
    if (setIndex === -1) {
      throw new Error('Set not found');
    }

    mockSets[setIndex] = {
      ...mockSets[setIndex],
      name: payload.setName,
      entries: payload.entries,
    };
  },

  // Delete set
  deleteSet: async (setId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const setIndex = mockSets.findIndex((s) => s.setId === setId);
    if (setIndex === -1) {
      throw new Error('Set not found');
    }

    mockSets.splice(setIndex, 1);
  },

  // Get recording for word (mock implementation)
  getRecording: async (word: string /*, wordType?: string*/): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // In a real implementation, this would return an audio URL
    // For now, we'll return a mock URL
    return `https://api.voicerss.org/?key=demo&hl=en-us&src=${encodeURIComponent(word)}`;
  },
};
