<?php

use App\Http\Controllers\Api\V1\AnnouncementController;
use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\AssessmentQuestionController;
use App\Http\Controllers\Api\V1\AssignmentSubmissionController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\CertificateController;
use App\Http\Controllers\Api\V1\CertificateTemplateController;
use App\Http\Controllers\Api\V1\ClassSessionController;
use App\Http\Controllers\Api\V1\CourseBatchController;
use App\Http\Controllers\Api\V1\CourseCategoryController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CourseFeedbackController;
use App\Http\Controllers\Api\V1\CourseModuleCommentController;
use App\Http\Controllers\Api\V1\CourseModuleController;
use App\Http\Controllers\Api\V1\CourseUnitController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\GlobalSearchController;
use App\Http\Controllers\Api\V1\GradebookController;
use App\Http\Controllers\Api\V1\LearningPathController;
use App\Http\Controllers\Api\V1\LessonController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\PositionController;
use App\Http\Controllers\Api\V1\PublicCertificateVerificationController;
use App\Http\Controllers\Api\V1\QuizEngineController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\SystemSettingController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Middleware\EnsureReadOnlyForGuest;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // --- Public Endpoints ---
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('auth/registration-options', [AuthController::class, 'registrationOptions']);
    Route::post('auth/register-student', [AuthController::class, 'registerStudent']);
    Route::get('public/verify-certificate/{code}', [PublicCertificateVerificationController::class, 'verify']);

    // --- Authenticated Endpoints (Sanctum) ---
    Route::middleware(['auth:sanctum', EnsureReadOnlyForGuest::class])->group(function () {

        // Auth & Profile
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::put('change-password', [AuthController::class, 'changePassword']);
        });

        // Dynamic Role-Aware Dashboard
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Global Search (Cmd+K)
        Route::get('search', [GlobalSearchController::class, 'search']);

        // Roles & Permissions (Dynamic RBAC)
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::post('roles/{role}/duplicate', [RoleController::class, 'duplicate']);
        Route::apiResource('roles', RoleController::class);

        // Organization & Branches Hierarchy
        Route::get('organization', [OrganizationController::class, 'show']);
        Route::put('organization', [OrganizationController::class, 'update']);
        Route::apiResource('branches', BranchController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('positions', PositionController::class);

        // Users Management & Multi-step Wizard
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::apiResource('users', UserController::class);

        // Staff & Students Profiles
        Route::apiResource('staff', StaffController::class);
        Route::apiResource('students', StudentController::class);

        // Curriculum (Courses, Categories, Paths, Modules, Lessons)
        Route::apiResource('course-categories', CourseCategoryController::class);
        Route::apiResource('learning-paths', LearningPathController::class);
        Route::post('courses/{course}/modules', [CourseModuleController::class, 'store']);
        Route::get('modules/{module}/comments', [CourseModuleCommentController::class, 'index']);
        Route::post('modules/{module}/comments', [CourseModuleCommentController::class, 'store']);
        Route::post('courses/{course}/units', [CourseUnitController::class, 'store']);
        Route::put('units/{unit}', [CourseUnitController::class, 'update']);
        Route::delete('units/{unit}', [CourseUnitController::class, 'destroy']);
        Route::post('courses/{course}/modules/reorder', [CourseModuleController::class, 'reorder']);
        Route::patch('courses/{course}/approve', [CourseController::class, 'approve']);
        Route::put('modules/{module}', [CourseModuleController::class, 'update']);
        Route::delete('modules/{module}', [CourseModuleController::class, 'destroy']);
        Route::post('modules/{module}/lessons', [LessonController::class, 'store']);
        Route::post('modules/{module}/lessons/reorder', [LessonController::class, 'reorder']);
        Route::post('lessons/{lesson}/progress', [LessonController::class, 'updateProgress']);
        Route::post('lessons/videos/upload', [LessonController::class, 'uploadVideo']);
        Route::apiResource('lessons', LessonController::class)->except(['index', 'store']);
        Route::apiResource('courses', CourseController::class);

        // Cohort Batches & Enrollments
        Route::post('batches/{batch}/trainers', [CourseBatchController::class, 'assignTrainers']);
        Route::get('batches/{batch}/attendance-matrix', [AttendanceController::class, 'getBatchMatrix']);
        Route::get('batches/{batch}/gradebook', [GradebookController::class, 'show']);
        Route::post('batches/{batch}/gradebook/mark', [GradebookController::class, 'recordMark']);
        Route::apiResource('batches', CourseBatchController::class);
        Route::patch('enrollments/{enrollment}/status', [EnrollmentController::class, 'updateStatus']);
        Route::patch('enrollments/{enrollment}/workflow', [EnrollmentController::class, 'advanceWorkflow']);
        Route::post('enrollments/apply', [EnrollmentController::class, 'apply']);
        Route::apiResource('enrollments', EnrollmentController::class);

        // Fees, payments and finance clearance
        Route::get('finance/enrollments', [FinanceController::class, 'index']);
        Route::put('finance/enrollments/{enrollment}/fee', [FinanceController::class, 'setFee']);
        Route::post('finance/payments', [FinanceController::class, 'recordPayment']);

        // Class Timetable & Attendance
        Route::get('class-sessions/{classSession}/attendance', [AttendanceController::class, 'getSessionRoster']);
        Route::post('class-sessions/{classSession}/attendance', [AttendanceController::class, 'recordAttendance']);
        Route::post('class-sessions/batch-schedule', [ClassSessionController::class, 'batchStore']);
        Route::post('class-sessions/check-conflicts', [ClassSessionController::class, 'checkConflicts']);
        Route::apiResource('class-sessions', ClassSessionController::class);

        // Assessments & Question Bank
        Route::post('assessments/{assessment}/questions', [AssessmentQuestionController::class, 'store']);
        Route::put('assessment-questions/{question}', [AssessmentQuestionController::class, 'update']);
        Route::delete('assessment-questions/{question}', [AssessmentQuestionController::class, 'destroy']);
        Route::apiResource('assessments', AssessmentController::class);

        // Student Quiz Engine
        Route::post('student/assessments/{assessment}/start', [QuizEngineController::class, 'startAttempt']);
        Route::post('student/assessment-attempts/{attempt}/submit', [QuizEngineController::class, 'submitAttempt']);
        Route::get('student/assessment-attempts/{attempt}/result', [QuizEngineController::class, 'getAttemptResult']);

        // Assignment Submissions & Grading
        Route::post('assessments/{assessment}/submissions', [AssignmentSubmissionController::class, 'store']);
        Route::post('assignment-submissions/{submission}/grade', [AssignmentSubmissionController::class, 'grade']);

        // Certificate Management & Issuance
        Route::get('certificate-templates', [CertificateTemplateController::class, 'index']);
        Route::post('certificate-templates', [CertificateTemplateController::class, 'store']);
        Route::post('certificates/check-eligibility', [CertificateController::class, 'checkEligibility']);
        Route::post('certificates/issue', [CertificateController::class, 'issue']);
        Route::post('certificates/{certificate}/revoke', [CertificateController::class, 'revoke']);
        Route::get('certificates', [CertificateController::class, 'index']);

        // Announcements, Audits, Settings & Reports
        Route::apiResource('announcements', AnnouncementController::class);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/export', [AuditLogController::class, 'exportCsv']);
        Route::delete('audit-logs', [AuditLogController::class, 'destroy']);
        Route::get('settings', [SystemSettingController::class, 'index']);
        Route::put('settings', [SystemSettingController::class, 'update']);
        Route::get('reports/{type}', [ReportController::class, 'generate']);
        Route::get('reports/{type}/export', [ReportController::class, 'exportCsv']);

        // Notifications Center
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // Course Feedback & Quality Assurance
        Route::get('feedbacks', [CourseFeedbackController::class, 'index']);
        Route::post('feedbacks', [CourseFeedbackController::class, 'store']);
    });
});
