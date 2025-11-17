import {
  TeamTransformer,
  UserTransformer,
  defaultUserTransformer,
  defaultOrganizationTeamTransformer,
} from '@backstage/plugin-catalog-backend-module-github';

// This team transformer makes use of the built in logic
export const myTeamTransformer: TeamTransformer = async (team, ctx) => {
  const backstageTeam = await defaultOrganizationTeamTransformer(team, ctx);
  if (backstageTeam && backstageTeam.spec) {
    backstageTeam.metadata.description = 'Integrated via GitHub Org Provider';

    // Example: add a label to all teams
    backstageTeam.metadata.labels = {
      ...backstageTeam.metadata.labels,
      'github-org-integration': 'true',
    };
  }
  return backstageTeam;
};

// This user transformer makes use of the built in logic
export const myUserTransformer: UserTransformer = async (user, ctx) => {
  const backstageUser = await defaultUserTransformer(user, ctx);
  if (backstageUser) {
    backstageUser.metadata.description = 'Integrated via GitHub Org Provider';

    // Example: add a label to all users
    backstageUser.metadata.labels = {
      ...backstageUser.metadata.labels,
      'github-org-integration': 'true',
    };
  }
  return backstageUser;
};