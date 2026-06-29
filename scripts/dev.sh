#!/bin/bash
trap 'printf "\033[?1000l\033[?1006l\n"' EXIT INT TERM
turbo run dev
