project(
  'kiwisolver',
  'cpp',
  version: run_command(
    'python',
    ['tools/git_version.py'],
    check: true,
  ).stdout().strip(),
  meson_version: '>=1.1.0',
  default_options: ['cpp_std=c++11'],
)

py = import('python').find_installation(pure: false)

cppy_dep = dependency('cppy', required: false)
if not cppy_dep.found()
  cppy_dep = declare_dependency(
    include_directories: include_directories('../cppy/cppy/include'),
    compile_args: ['-std=c++11'],
  )
endif

version_header = configure_file(
  input: 'py/src/version.h.in',
  output: 'version.h',
  configuration: {
    'KIWI_VERSION': meson.project_version(),
  },
)

kiwisolver_ext = py.extension_module(
  '_cext',
  [
    'py/src/kiwisolver.cpp',
    'py/src/constraint.cpp',
    'py/src/expression.cpp',
    'py/src/solver.cpp',
    'py/src/strength.cpp',
    'py/src/term.cpp',
    'py/src/variable.cpp',
  ],
  include_directories: [
    meson.current_build_dir(),
    include_directories('.'),
    include_directories('py/src'),
  ],
  dependencies: [cppy_dep],
  install: true,
  subdir: 'kiwisolver',
)

install_subdir('py/kiwisolver', install_dir: py.get_install_dir(), exclude_files: ['__pycache__'])
