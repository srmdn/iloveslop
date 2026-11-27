#!/usr/bin/env bash
# Link the iloveslop skills into an agent's skill folder.
# Run this from the project you are building, not from the repository.
# Symlinks mean `git pull` in the clone updates every installed skill.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(pwd)

usage() {
  cat <<'EOF'
usage: install.sh [--claude] [--codex] [--cursor] [--hermes] [--all]

  --claude   link into .claude/skills in the current project (default)
  --codex    link into .codex/skills in the current project
  --cursor   link into .cursor/skills in the current project
  --hermes   link into ~/.hermes/skills
  --all      all of the above

The installer also links slop.md and DIRECTION.md into the current project,
unless a file with that name already exists. Nothing is overwritten.
EOF
}

want_claude=0
want_codex=0
want_cursor=0
want_hermes=0

if [ "$#" -eq 0 ]; then
  want_claude=1
fi

for arg in "$@"; do
  case "$arg" in
    --claude) want_claude=1 ;;
    --codex) want_codex=1 ;;
    --cursor) want_cursor=1 ;;
    --hermes) want_hermes=1 ;;
    --all)
      want_claude=1
      want_codex=1
      want_cursor=1
      want_hermes=1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

link_skill() {
  target_dir=$1
  mkdir -p "$target_dir"
  for skill in "$SCRIPT_DIR"/skills/*; do
    name=$(basename "$skill")
    dest="$target_dir/$name"
    if [ -L "$dest" ]; then
      current=$(readlink "$dest")
      if [ "$current" = "$skill" ]; then
        echo "already linked: $dest"
      else
        echo "skip: $dest points somewhere else" >&2
      fi
    elif [ -e "$dest" ]; then
      echo "skip: $dest already exists" >&2
    else
      ln -s "$skill" "$dest"
      echo "linked: $dest"
    fi
  done
}

link_file() {
  src=$1
  dest=$2
  if [ "$src" = "$dest" ]; then
    return 0
  fi
  if [ -e "$dest" ] && [ "$dest" -ef "$src" ]; then
    return 0
  fi
  if [ -L "$dest" ]; then
    current=$(readlink "$dest")
    if [ "$current" = "$src" ]; then
      echo "already linked: $dest"
    else
      echo "skip: $dest points somewhere else" >&2
    fi
  elif [ -e "$dest" ]; then
    echo "skip: $dest already exists" >&2
  else
    ln -s "$src" "$dest"
    echo "linked: $dest"
  fi
}

if [ "$PROJECT_DIR" -ef "$SCRIPT_DIR" ]; then
  echo "run this from the project you are building, not from the iloveslop repository" >&2
  exit 2
fi

echo "project: $PROJECT_DIR"
echo "source:  $SCRIPT_DIR"

if [ "$want_claude" -eq 1 ]; then
  link_skill "$PROJECT_DIR/.claude/skills"
fi
if [ "$want_codex" -eq 1 ]; then
  link_skill "$PROJECT_DIR/.codex/skills"
fi
if [ "$want_cursor" -eq 1 ]; then
  link_skill "$PROJECT_DIR/.cursor/skills"
fi
if [ "$want_hermes" -eq 1 ]; then
  link_skill "${HOME:?HOME is not set}/.hermes/skills"
fi

link_file "$SCRIPT_DIR/slop.md" "$PROJECT_DIR/slop.md"
link_file "$SCRIPT_DIR/DIRECTION.md" "$PROJECT_DIR/DIRECTION.md"

echo "done. start a new agent session."
