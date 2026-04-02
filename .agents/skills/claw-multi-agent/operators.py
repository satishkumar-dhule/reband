#!/usr/bin/env python3
"""
Operator functions for multi-agent system result processing.

Provides utility functions for aggregating, filtering, merging,
deduplicating, and sorting results from multiple agents.
"""

from typing import Any, Callable, TypeVar

T = TypeVar("T")


def aggregate_results(results: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Combine results from multiple agents into a single aggregated result.

    Args:
        results: List of result dictionaries from agents.
                 Each dict may contain: 'content', 'data', 'metadata', etc.

    Returns:
        Aggregated dictionary with combined content and metadata.
    """
    if not results:
        return {"content": "", "data": [], "metadata": {}}

    aggregated = {
        "content": "\n\n".join(
            str(r.get("content", "")) for r in results if r.get("content")
        ),
        "data": [],
        "metadata": {
            "agent_count": len(results),
            "sources": [
                r.get("source", r.get("label", f"agent-{i}"))
                for i, r in enumerate(results)
            ],
        },
    }

    for r in results:
        if "data" in r:
            if isinstance(r["data"], list):
                aggregated["data"].extend(r["data"])
            else:
                aggregated["data"].append(r["data"])

    return aggregated


def filter_by_quality(
    results: list[dict[str, Any]],
    threshold: float = 0.7,
    score_key: str = "quality_score",
) -> list[dict[str, Any]]:
    """
    Filter results by quality score.

    Args:
        results: List of result dictionaries.
        threshold: Minimum quality score (0.0 to 1.0).
        score_key: Key containing the quality score in each result.

    Returns:
        Filtered list of results meeting the threshold.
    """
    return [
        r
        for r in results
        if isinstance(r.get(score_key), (int, float)) and r[score_key] >= threshold
    ]


def merge_context(contexts: list[str]) -> str:
    """
    Merge multiple agent contexts into a single context string.

    Args:
        contexts: List of context strings from different agents.

    Returns:
        Merged context string with deduplicated content.
    """
    if not contexts:
        return ""

    seen_lines: set[str] = set()
    merged_lines: list[str] = []

    for context in contexts:
        if not context:
            continue
        for line in context.split("\n"):
            stripped = line.strip()
            if stripped and stripped not in seen_lines:
                seen_lines.add(stripped)
                merged_lines.append(stripped)

    return "\n".join(merged_lines)


def deduplicate_results(
    results: list[dict[str, Any]],
    key: str | Callable[[dict[str, Any]], Any] = "id",
) -> list[dict[str, Any]]:
    """
    Remove duplicate entries from results.

    Args:
        results: List of result dictionaries.
        key: Field name or callable to identify duplicates.
             If string, uses result[key] as identifier.
             If callable, uses key(result) as identifier.

    Returns:
        Deduplicated list of results preserving original order.
    """
    if not results:
        return []

    seen: set[Any] = set()
    deduplicated: list[dict[str, Any]] = []

    for r in results:
        identifier = key(r) if callable(key) else r.get(key)
        if identifier is not None and identifier not in seen:
            seen.add(identifier)
            deduplicated.append(r)

    return deduplicated


def sort_by_priority(
    results: list[dict[str, Any]],
    priority_key: str = "priority",
    reverse: bool = False,
) -> list[dict[str, Any]]:
    """
    Sort results by priority.

    Args:
        results: List of result dictionaries.
        priority_key: Key containing priority value (int or float).
        reverse: If True, sort descending (highest priority first).

    Returns:
        Sorted list of results.
    """

    def get_priority(r: dict[str, Any]) -> tuple[int, str]:
        value = r.get(priority_key, 0)
        if isinstance(value, (int, float)):
            return (0, str(value)) if value >= 0 else (1, str(value))
        return (2, str(value))

    return sorted(results, key=get_priority, reverse=reverse)
