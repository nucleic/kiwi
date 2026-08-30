#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run_git(*args: str, allow_failure: bool = False) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if proc.returncode != 0 and not allow_failure:
        raise subprocess.CalledProcessError(
            proc.returncode,
            ["git", *args],
            output=proc.stdout,
            stderr=proc.stderr,
        )
    return proc.stdout.strip()


def normalize_tag(tag: str) -> str:
    tag = tag.strip()
    if tag.startswith("v"):
        tag = tag[1:]
    return tag


def normalize_version(raw: str) -> str:
    """Normalize git describe output into a setuptools_scm-like version string.

    Supported inputs include exact release tags, post-tag commits, dirty trees,
    untagged repositories, and the fallback forms used by the Git version helper.
    """
    raw = raw.strip()
    dirty = raw.endswith("-dirty")
    if dirty:
        raw = raw[: -len("-dirty")]

    if not raw or raw == "HEAD":
        sha = run_git("rev-parse", "--short", "HEAD", allow_failure=True) or "unknown"
        date = run_git("log", "-1", "--format=%cs", allow_failure=True).replace("-", "") or "unknown"
        version = f"0+unknown.g{sha}.d{date}"
        if dirty:
            version += ".dirty"
        return version

    match = re.fullmatch(r"(?P<tag>.+)-(?P<count>\d+)-g(?P<sha>[0-9a-f]+)", raw, flags=re.IGNORECASE)
    if match is not None:
        tag = normalize_tag(match.group("tag"))
        count = int(match.group("count"))
        sha = match.group("sha")[:7]
        version = tag if count == 0 else f"{tag}.dev{count}+g{sha}"
        if dirty:
            version += ".dirty"
        return version

    match = re.fullmatch(r"0-g(?P<sha>[0-9a-f]+)", raw, flags=re.IGNORECASE)
    if match is not None:
        sha = match.group("sha")[:7]
        version = f"0+unknown.g{sha}.dunknown"
        if dirty:
            version += ".dirty"
        return version

    match = re.fullmatch(r"(?P<sha>[0-9a-f]+)", raw, flags=re.IGNORECASE)
    if match is not None:
        sha = match.group("sha")[:7]
        version = f"0+unknown.g{sha}.dunknown"
        if dirty:
            version += ".dirty"
        return version

    if re.fullmatch(r"v?[0-9A-Za-z_.+-]+", raw):
        version = normalize_tag(raw)
        if dirty:
            version += ".dirty"
        return version

    raise ValueError(f"Unsupported git version format: {raw!r}")


def run_self_tests() -> None:
    cases = [
        ("1.4.8", "1.4.8"),
        ("1.4.8-dirty", "1.4.8.dirty"),
        ("1.4.8-0-gabcdef1", "1.4.8"),
        ("1.4.8-5-gabcdef1", "1.4.8.dev5+gabcdef1"),
        ("1.4.8-5-gabcdef1-dirty", "1.4.8.dev5+gabcdef1.dirty"),
        ("v1.4.8", "1.4.8"),
        ("v1.4.8-5-gabcdef1-dirty", "1.4.8.dev5+gabcdef1.dirty"),
        ("0-gabcdef1", "0+unknown.gabcdef1.dunknown"),
        ("abcdef1", "0+unknown.gabcdef1.dunknown"),
        ("2.0.0rc1", "2.0.0rc1"),
        ("release-2024.11", "release-2024.11"),
    ]

    for raw, expected in cases:
        actual = normalize_version(raw)
        if actual != expected:
            raise AssertionError(f"normalize_version({raw!r}) -> {actual!r}, expected {expected!r}")

    try:
        normalize_version("not a valid git describe")
    except ValueError:
        pass
    else:
        raise AssertionError("normalize_version accepted an unsupported git describe value")

    print(f"self-test passed for {len(cases)} normalization cases")


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute a setuptools_scm-like version from git metadata.")
    parser.add_argument("--self-test", action="store_true", help="run the inline normalization tests")
    args = parser.parse_args()

    if args.self_test:
        run_self_tests()
        return

    try:
        repo_version = run_git("describe", "--tags", "--dirty", "--always", "--long", allow_failure=True)
    except subprocess.CalledProcessError:
        repo_version = ""

    if repo_version:
        print(normalize_version(repo_version))
        return

    sha = run_git("rev-parse", "--short", "HEAD", allow_failure=True) or "unknown"
    date = run_git("log", "-1", "--format=%cs", allow_failure=True).replace("-", "") or "unknown"
    print(f"0+unknown.g{sha}.d{date}")


if __name__ == "__main__":
    main()
