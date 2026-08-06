/**
 * The TalentDialer dashboard.
 *
 * Mounted under /hiring/*. The public NxtHike site is untouched — this replaces
 * only the logged-in hiring workspace.
 */

import React, { useEffect } from 'react';
import './desk.css';
import { T } from './tokens';
import { useDesk, SCREENS, type ScreenKey } from './store';
import { Shell } from './Shell';
import { Modals } from './Modals';
import { Button, EmptyState, Icon, SkeletonRows } from './ui';

import { HomeScreen, NotificationsScreen, TasksScreen } from './screens/Today';
import { QueueScreen, CallbacksScreen, HistoryScreen, SummaryScreen } from './screens/Calls';
import { CandidatesScreen, AddCandidateScreen, MergeScreen, TagsScreen, ResumeScreen } from './screens/People';
import {
  RequisitionsScreen, RequisitionScreen, NewRequisitionScreen, KanbanScreen,
  ClientsScreen, ClientScreen, SubmissionsScreen,
} from './screens/Demand';
import {
  ComposerScreen, TemplatesScreen, InterviewsScreen, ScheduleInterviewScreen,
  InterviewKitScreen, ScorecardScreen, OffersScreen, OfferScreen,
  OfferLetterScreen, ApprovalsScreen,
} from './screens/Process';
import { FeedScreen, PerformanceScreen, TeamScreen } from './screens/Insight';
import {
  SettingsScreen, UsersScreen, CallWindowScreen, RolesScreen,
  ComplianceScreen, AuditScreen, TaxonomyScreen, SyncScreen, StatesScreen,
} from './screens/Admin';
import {
  CatalogOverviewScreen, CatalogJobsScreen, CatalogEventsScreen,
  CatalogCoursesScreen, CatalogCompaniesScreen, CatalogHiringRolesScreen,
} from './screens/Catalog';

const SCREEN_MAP: Record<ScreenKey, React.ComponentType> = {
  home: HomeScreen,
  notifs: NotificationsScreen,
  tasks: TasksScreen,

  queue: QueueScreen,
  callbacks: CallbacksScreen,
  history: HistoryScreen,
  summary: SummaryScreen,

  cands: CandidatesScreen,
  addcand: AddCandidateScreen,
  merge: MergeScreen,
  resume: ResumeScreen,
  tags: TagsScreen,

  jobs: RequisitionsScreen,
  job: RequisitionScreen,
  newjob: NewRequisitionScreen,
  kanban: KanbanScreen,
  clients: ClientsScreen,
  client: ClientScreen,
  subs: SubmissionsScreen,

  composer: ComposerScreen,
  templates: TemplatesScreen,
  intcal: InterviewsScreen,
  intsched: ScheduleInterviewScreen,
  intkit: InterviewKitScreen,
  scorecard: ScorecardScreen,
  offers: OffersScreen,
  offer: OfferScreen,
  offerletter: OfferLetterScreen,
  approvals: ApprovalsScreen,

  feed: FeedScreen,
  perf: PerformanceScreen,
  team: TeamScreen,

  settings: SettingsScreen,
  users: UsersScreen,
  callwindow: CallWindowScreen,
  roles: RolesScreen,
  compliance: ComplianceScreen,
  audit: AuditScreen,
  taxonomy: TaxonomyScreen,
  sync: SyncScreen,
  states: StatesScreen,

  portalOverview: CatalogOverviewScreen,
  portalJobs: CatalogJobsScreen,
  portalEvents: CatalogEventsScreen,
  portalCourses: CatalogCoursesScreen,
  portalCompanies: CatalogCompaniesScreen,
  portalRoles: CatalogHiringRolesScreen,
};

/* ------------------------------------------------------------------ *
 *  Boot states                                                       *
 * ------------------------------------------------------------------ */

function BootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  // 401/403 mean the account exists but has no workspace role — a different
  // problem from the API being unreachable, and it needs a different answer.
  const denied = /403|forbidden|not authorised|not authorized|no workspace/i.test(message);
  const unauth = /401|unauthor/i.test(message);

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: T.canvas,
    }}>
      <div style={{ maxWidth: 460, textAlign: 'center' }}>
        <span style={{
          width: 56, height: 56, borderRadius: 16, background: denied ? T.amberTint : T.redTint,
          display: 'grid', placeItems: 'center', margin: '0 auto',
        }}>
          <Icon name={denied ? 'lock' : unauth ? 'login' : 'cloud_off'} size={27} color={denied ? T.amber : T.red} />
        </span>
        <h2 style={{ margin: '16px 0 0', fontSize: 19, fontWeight: 700 }}>
          {denied ? 'No workspace access' : unauth ? 'Please sign in' : 'Cannot reach the workspace'}
        </h2>
        <p style={{ margin: '9px 0 0', fontSize: 13, color: T.inkMuted, lineHeight: 1.6 }}>
          {denied
            ? 'This account can use the NxtHike portal but has not been given a role in the hiring workspace. Ask an admin to assign one.'
            : unauth
              ? 'Your session has expired. Sign in again to open the dashboard.'
              : message}
        </p>
        <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {unauth
            ? <Button icon="login" onClick={() => { window.location.href = '/login'; }}>Go to sign in</Button>
            : <Button icon="refresh" onClick={onRetry}>Try again</Button>}
          <Button variant="ghost" onClick={() => { window.location.href = '/'; }}>Back to NxtHike</Button>
        </div>
      </div>
    </div>
  );
}

function BootLoading() {
  return (
    <div style={{ minHeight: '100vh', background: T.canvas, padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SkeletonRows rows={7} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  App                                                               *
 * ------------------------------------------------------------------ */

export default function DeskApp() {
  const { loading, error, session, screen, allowed, boot, go } = useDesk();

  useEffect(() => { boot(); }, [boot]);

  // Keep the document title in step with the screen so browser history is readable.
  useEffect(() => {
    if (session) document.title = `${SCREENS[screen].name} · NxtHike Workspace`;
  }, [screen, session]);

  if (loading) return <div className="desk desk-boot"><BootLoading /></div>;
  if (error || !session) {
    return <div className="desk desk-boot"><BootError message={error || 'No session'} onRetry={boot} /></div>;
  }

  const Screen = SCREEN_MAP[screen];
  const permitted = allowed(screen);

  // Single `.desk` root — Shell must not nest another fixed full-screen shell
  // or the main pane can fail to fill the viewport / clip content.
  return (
    <div className="desk">
      <Shell>
        {permitted ? (
          <Screen />
        ) : (
          <div className="pad">
            <EmptyState
              icon="lock"
              title={`${SCREENS[screen].name} is not part of your role`}
              body={`Your ${session.personaName} role does not include this screen. The API enforces the same rule, so opening it directly would fail too.`}
              actionLabel="Back to dashboard"
              onAction={() => go(session.landing as ScreenKey)}
            />
          </div>
        )}
      </Shell>
      <Modals />
    </div>
  );
}
