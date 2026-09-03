export interface User {
  id?: number;
  uuid: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  organization?: {
    uuid: string;
    name: string;
    code: string;
  };
  branch?: {
    uuid: string;
    name: string;
    code: string;
  };
  department?: {
    uuid: string;
    name: string;
    code?: string;
  };
  position?: {
    uuid: string;
    name: string;
  };
  roles: string[];
  permissions: string[];
  profile_photo_path?: string;
  is_staff?: boolean;
  is_student?: boolean;
  student_number?: string;
  employee_number?: string;
}

export interface Branch {
  id?: number;
  uuid: string;
  name: string;
  code: string;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  users_count?: number;
  batches_count?: number;
  manager?: User;
}

export interface Department {
  id?: number;
  uuid: string;
  name: string;
  code?: string;
  description?: string;
  branch?: Branch;
}

export interface Position {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
}

export interface Role {
  uuid: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_protected: boolean;
  users_count?: number;
  permissions: string[];
  permissions_count?: number;
}

export interface PermissionGroup {
  group: string;
  permissions: {
    id: number;
    name: string;
    display_name: string;
    description?: string;
  }[];
}

export interface Course {
  uuid: string;
  code: string;
  name: string;
  short_description?: string;
  description?: string;
  thumbnail_path?: string;
  duration: number;
  duration_unit: 'hours' | 'days' | 'weeks' | 'months';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  status: 'draft' | 'active' | 'archived';
  category?: {
    uuid: string;
    name: string;
  };
  modules?: CourseModule[];
  units?: CourseUnit[];
  modules_count?: number;
  batches_count?: number;
  batches?: CourseBatch[];
  learning_progress?: {
    percentage: number;
    completed_lessons?: number;
    total_lessons?: number;
    completed_lesson_uuids?: string[];
  } | null;
}

export interface CourseModule {
  uuid: string;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
  unit_id?: number;
  unit?: CourseUnit;
}

export interface CourseUnit {
  uuid: string;
  title: string;
  description?: string;
  order: number;
  modules?: CourseModule[];
}

export interface Lesson {
  uuid: string;
  title: string;
  description?: string;
  content_type: 'video' | 'pdf' | 'document' | 'presentation' | 'audio' | 'external_link' | 'text' | 'scorm';
  content?: string;
  video_url?: string;
  file_path?: string;
  external_url?: string;
  duration?: number;
  order: number;
  is_preview?: boolean;
}

export interface CourseBatch {
  uuid: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  course?: Course;
  branch?: Branch;
  trainers?: User[];
  enrollments_count?: number;
}

export interface Enrollment {
  uuid: string;
  enrollment_number: string;
  enrollment_date: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Suspended' | 'Withdrawn' | 'Cancelled';
  completion_date?: string;
  final_grade?: string;
  final_score?: number;
  student?: User;
  batch?: CourseBatch;
}

export interface StudentProfile {
  uuid: string;
  student_number: string;
  admission_date: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  national_id?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: string;
  user: User;
  guardians?: {
    uuid: string;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    pivot: {
      relationship: string;
    };
  }[];
}

export interface Assessment {
  uuid: string;
  title: string;
  description?: string;
  type: 'Quiz' | 'Assignment' | 'CAT' | 'Exam' | 'Practical' | 'Project' | 'Final Examination';
  weight_percentage: number;
  total_marks: number;
  pass_mark: number;
  time_limit?: number;
  attempts_allowed: number;
  due_date?: string;
  status: 'draft' | 'published' | 'closed';
  batch?: CourseBatch;
  questions?: AssessmentQuestion[];
  questions_count?: number;
}

export interface AssessmentQuestion {
  uuid: string;
  question_text: string;
  question_type: 'Multiple Choice' | 'Multiple Select' | 'True/False' | 'Short Answer' | 'Essay' | 'Practical/Manual Grading';
  marks: number;
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  order: number;
  options?: {
    id: number;
    uuid: string;
    option_text: string;
    is_correct?: boolean;
  }[];
}

export interface Certificate {
  uuid: string;
  certificate_number: string;
  verification_code: string;
  issue_date: string;
  final_grade?: string;
  final_score?: number;
  status: 'issued' | 'revoked';
  revoked_reason?: string;
  student?: User;
  course?: Course;
  batch?: CourseBatch;
  template?: {
    name: string;
    title: string;
    signatory_name: string;
    signatory_title: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  errors?: Record<string, string[]>;
}
