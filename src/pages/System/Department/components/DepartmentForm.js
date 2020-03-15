import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Switch, TreeSelect, Button, message } from 'antd';
import styles from '../../System.less';

const FormItem = Form.Item;
const { TextArea } = Input;

const DepartmentForm = connect(({ systemDepartment: { tree, department }, loading }) => ({
  tree,
  department,
  loading:
    loading.effects[
      ('systemDepartment/fetchById', 'systemDepartment/add', 'systemDepartment/delete')
    ],
}))(({ loading, children, isEdit, id, department, tree, dispatch }) => {
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  // 【模态框显示隐藏属性】
  const [visible, setVisible] = useState(false);

  // 【模态框显示隐藏函数】
  const showModalHandler = e => {
    if (e) e.stopPropagation();
    setVisible(true);
  };
  const hideModelHandler = () => {
    setVisible(false);
  };

  // 【修改时，获取表单】
  useEffect(() => {
    if (visible && isEdit) {
      dispatch({
        type: 'systemDepartment/fetchById',
        payload: {
          id,
        },
      });
    }
    return () => {
      dispatch({
        type: 'systemDepartment/clear',
      });
    };
  }, [visible, isEdit, id, dispatch]);

  // 【修改时，回显表单】
  useEffect(() => {
    // 👍 将条件判断放置在 effect 中
    if (visible && isEdit) {
      if (Object.keys(department).length > 0) {
        // 不论是否修改父部门，保证页面停留在原页面下。
        const { name, parentId, status, description } = department;
        const formData = {
          name,
          parentId: parentId.toString(),
          status,
          description,
        };
        if (!department.parentId) {
          delete formData.parentId;
        }
        setFieldsValue({ ...formData });
      }
    }
  }, [visible, isEdit, department, setFieldsValue]);

  // 【新建时，保证任何时候添加上级菜单都有默认值】
  // 不论是否修改父部门，保证页面停留在原页面下。
  useEffect(() => {
    if (visible && !isEdit) {
      if (id) {
        setFieldsValue({ parentId: id.toString() });
      }
    }
  }, [visible, isEdit, id, tree, setFieldsValue]);

  // 【添加与修改】
  const handleAddOrUpdate = values => {
    if (isEdit) {
      dispatch({
        type: 'systemDepartment/update',
        payload: {
          ...values,
          id,
          oldParentId: department.parentId,
        },
        callback: () => {
          resetFields();
          hideModelHandler();
          message.success('部门修改成功。');
        },
      });
    } else {
      dispatch({
        type: 'systemDepartment/add',
        payload: {
          ...values,
          oldParentId: id,
        },
        callback: () => {
          resetFields();
          hideModelHandler();
          message.success('部门添加成功。');
        },
      });
    }
  };

  // 【表单布局】
  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };
  const tailLayout = {
    wrapperCol: {
      xs: { span: 24 },
      sm: { offset: 5, span: 19 },
    },
  };

  return (
    <>
      <span onClick={showModalHandler}>{children}</span>
      <Modal
        forceRender
        destroyOnClose
        title={isEdit ? '修改' : '新增'}
        visible={visible}
        onCancel={hideModelHandler}
        footer={null}
      >
        <Form
          {...layout}
          form={form}
          className={styles.form}
          name="departmentForm"
          initialValues={{
            status: true,
          }}
          onFinish={handleAddOrUpdate}
        >
          <FormItem
            label="名称"
            name="name"
            rules={[
              {
                required: true,
                message: '请将名称长度保持在1至20字符之间！',
                min: 1,
                max: 20,
              },
            ]}
          >
            <Input />
          </FormItem>
          <FormItem
            label="父部门"
            name="parentId"
            rules={[{ required: true, message: '请选择一个父部门！' }]}
          >
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={tree}
              placeholder="请选择部门。"
              treeDefaultExpandAll
            />
          </FormItem>
          <FormItem label="状态" name="status" rules={[{ required: true }]} valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </FormItem>
          <FormItem
            label="描述"
            name="description"
            rules={[{ message: '请将描述长度保持在1至50字符之间！', min: 1, max: 50 }]}
          >
            <TextArea placeholder="请输入部门描述。" autoSize={{ minRows: 2, maxRows: 6 }} />
          </FormItem>
          <FormItem {...tailLayout}>
            <Button onClick={hideModelHandler}>取消</Button>
            <Button type="primary" loading={loading} htmlType="submit">
              确定
            </Button>
          </FormItem>
        </Form>
      </Modal>
    </>
  );
});

export default DepartmentForm;
