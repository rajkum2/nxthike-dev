/**
 * NxtHike Workspace (recruiting + portal catalog).
 *
 * Mounted under /hiring/*. Screen modules are lazy-loaded so the initial
 * workspace chunk stays smaller; home boots first.
 */

import React, { Suspense, lazy, useEffect, type ComponentType } from 'react';
import './desk.css';
import { T } from './tokens';
import { useDesk, SCREENS, type ScreenKey } from './store';
import { Shell } from './Shell';
import { Modals } from './Modals';
import { Button, EmptyState, Icon, SkeletonRows } from './ui';

// Core screens used at boot / daily — still code-split but prioritized
const HomeScreen = lazy(() => import('./screens/Today').then((m) => ({ default: m.HomeScreen })));
const NotificationsScreen = lazy(() => import('./screens/Today').then((m) => ({ default: m.NotificationsScreen })));
const TasksScreen = lazy(() => import('./screens/Today').then((m) => ({ default: m.TasksScreen })));

const QueueScreen = lazy(() => import('./screens/Calls').then((m) => ({ default: m.QueueScreen })));
const CallbacksScreen = lazy(() => import('./screens/Calls').then((m) => ({ default: m.CallbacksScreen })));
const HistoryScreen = lazy(() => import('./screens/Calls').then((m) => ({ default: m.HistoryScreen })));
const SummaryScreen = lazy(() => import('./screens/Calls').then((m) => ({ default: m.SummaryScreen })));

const CandidatesScreen = lazy(() => import('./screens/People').then((m) => ({ default: m.CandidatesScreen })));
const AddCandidateScreen = lazy(() => import('./screens/People').then((m) => ({ default: m.AddCandidateScreen })));
const MergeScreen = lazy(() => import('./screens/People').then((m) => ({ default: m.MergeScreen })));
const TagsScreen = lazy(() => import('./screens/People').then((m) => ({ default: m.TagsScreen })));
const ResumeScreen = lazy(() => import('./screens/People').then((m) => ({ default: m.ResumeScreen })));

const RequisitionsScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.RequisitionsScreen })));
const RequisitionScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.RequisitionScreen })));
const NewRequisitionScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.NewRequisitionScreen })));
const KanbanScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.KanbanScreen })));
const ClientsScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.ClientsScreen })));
const ClientScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.ClientScreen })));
const SubmissionsScreen = lazy(() => import('./screens/Demand').then((m) => ({ default: m.SubmissionsScreen })));

const ComposerScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.ComposerScreen })));
const TemplatesScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.TemplatesScreen })));
const InterviewsScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.InterviewsScreen })));
const ScheduleInterviewScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.ScheduleInterviewScreen })));
const InterviewKitScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.InterviewKitScreen })));
const ScorecardScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.ScorecardScreen })));
const OffersScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.OffersScreen })));
const OfferScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.OfferScreen })));
const OfferLetterScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.OfferLetterScreen })));
const ApprovalsScreen = lazy(() => import('./screens/Process').then((m) => ({ default: m.ApprovalsScreen })));

const FeedScreen = lazy(() => import('./screens/Insight').then((m) => ({ default: m.FeedScreen })));
const PerformanceScreen = lazy(() => import('./screens/Insight').then((m) => ({ default: m.PerformanceScreen })));
const TeamScreen = lazy(() => import('./screens/Insight').then((m) => ({ default: m.TeamScreen })));

const SettingsScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.SettingsScreen })));
const UsersScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.UsersScreen })));
const CallWindowScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.CallWindowScreen })));
const RolesScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.RolesScreen })));
const ComplianceScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.ComplianceScreen })));
const AuditScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.AuditScreen })));
const TaxonomyScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.TaxonomyScreen })));
const SyncScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.SyncScreen })));
const StatesScreen = lazy(() => import('./screens/Admin').then((m) => ({ default: m.StatesScreen })));

const CatalogOverviewScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogOverviewScreen })));
const CatalogJobsScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogJobsScreen })));
const CatalogEventsScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogEventsScreen })));
const CatalogCoursesScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogCoursesScreen })));
const CatalogCompaniesScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogCompaniesScreen })));
const CatalogHiringRolesScreen = lazy(() => import('./screens/Catalog').then((m) => ({ default: m.CatalogHiringRolesScreen })));

const SCREEN_MAP: Record<ScreenKey, React.LazyExoticComponent<ComponentType>> = {
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

function ScreenFallback() {
  return (
    <div className="pad">
      <SkeletonRows rows={6} />
    </div>
  );
}

function BootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const denied = /403|forbidden|not authorised|not authorized|no workspace/i.test(message);
  const unauth = /401|unauthor|session expired/i.test(message);

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: T.canvas,
    }}
    >
      <div style={{ maxWidth: 460, textAlign: 'center' }}>
        <span style={{
          width: 56, height: 56, borderRadius: 16, background: denied ? T.amberTint : T.redTint,
          display: 'grid', placeItems: 'center', margin: '0 auto',
        }}
        >
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

export default function DeskApp() {
  const { loading, error, session, screen, allowed, boot, go } = useDesk();

  useEffect(() => { boot(); }, [boot]);

  useEffect(() => {
    if (session) document.title = `${SCREENS[screen].name} · NxtHike Workspace`;
  }, [screen, session]);

  if (loading) return <div className="desk desk-boot"><BootLoading /></div>;
  if (error || !session) {
    return <div className="desk desk-boot"><BootError message={error || 'No session'} onRetry={boot} /></div>;
  }

  const Screen = SCREEN_MAP[screen];
  const permitted = allowed(screen);

  return (
    <div className="desk">
      <Shell>
        {permitted ? (
          <Suspense fallback={<ScreenFallback />}>
            <Screen />
          </Suspense>
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
