#!/bin/bash
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_EMAIL" = "integrante3@reservas.app" ]; then
    export GIT_AUTHOR_NAME="shadowraven69"
    export GIT_AUTHOR_EMAIL="stevenpajarogarcia@gmail.com"
fi
if [ "$GIT_COMMITTER_EMAIL" = "integrante3@reservas.app" ]; then
    export GIT_COMMITTER_NAME="shadowraven69"
    export GIT_COMMITTER_EMAIL="stevenpajarogarcia@gmail.com"
fi
' --tag-name-filter cat -- --branches --tags
