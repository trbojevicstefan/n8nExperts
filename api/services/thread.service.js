import WorkspaceThread from "../models/workspaceThread.model.js";

export const ensureWorkspaceThread = async ({ jobId, clientId, expertId, invitationId = null, applicationId = null }) => {
  const setFields = {};
  if (invitationId) setFields.invitationId = invitationId;
  if (applicationId) setFields.applicationId = applicationId;

  const thread = await WorkspaceThread.findOneAndUpdate(
    { jobId, clientId, expertId },
    {
      $setOnInsert: {
        jobId,
        clientId,
        expertId,
        unreadByClient: 0,
        unreadByExpert: 0,
        archivedByClient: false,
        archivedByExpert: false,
      },
      ...(Object.keys(setFields).length > 0 && { $set: setFields }),
    },
    {
      new: true,
      upsert: true,
    }
  );

  return thread;
};
