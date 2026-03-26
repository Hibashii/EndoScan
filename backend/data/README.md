# /backend/data/
#
# Place cleaned CSV datasets here.
#
# Expected files:
#   tedx_substances.csv — TEDX thyroid-disrupting substances
#
# CSV format for tedx_substances.csv:
#   cas,name,risk,effects
#   3380-34-5,triclosan,high,"thyroid,reproductive"
#
# Columns:
#   cas      — CAS registry number (string)
#   name     — substance name or synonym (lowercase preferred)
#   risk     — risk level: "high", "medium", or "low"
#   effects  — comma-separated effect categories (inside quotes if multiple)
#
# Multiple rows with the same CAS number represent synonyms for one substance.
# The mock file (tedx_substances.csv) ships with the repo as a working default.
# When your team provides cleaned data, replace or extend this file.
