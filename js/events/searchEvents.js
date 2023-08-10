/**
 * Types of events that can be triggered for the search.
 * Each event is published with a different data structure, following the
 * PubSub publish method signature.
 * SearchEvents data structures:
 *  - SearchEventsTypes.AddTag: { filterId: string, tag: string }
 *  - SearchEventsTypes.RemoveTag: { filterId: string, tag: string }
 *  - SearchEventsTypes.MainSearch: { search: string }
 *  - SearchEventsTypes.UpdateFilterOptions: Map<Filter.id, { searchTags: string[], options: string[] }>
 *  - SearchEventsTypes.UpdateSearchResult: { recipes: Recipe[], hadPartialBefore: boolean, searchInput: string }
 *  - SearchEventsTypes.NumberOfResults: { results: number }
 */
export const SearchEventsTypes = {
  AddTag: "addSearchTag",
  RemoveTag: "removeSearchTag",
  MainSearch: "mainSearch",
  UpdateFilterOptions: "updateFilterOptions",
  UpdateSearchResult: "updateSearchResult",
  NumberOfResults: "numberOfResults",
};
